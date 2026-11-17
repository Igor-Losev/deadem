/** @import { NodeReadable } from '#core/stream/Pipeline.js' */
/** @import SchemaRegistry from '../schema/SchemaRegistry.js' */

import Assert from '../core/Assert.js';
import Logger from '../core/Logger.js';
import Pipeline from '#core/stream/Pipeline.js';
import WritableSink from '#core/stream/WritableSink.js';

import CutterConfiguration from '../configurations/CutterConfiguration.js';

import DemoSource from '../data/enums/DemoSource.js';
import PerformanceTrackerCategory from '../data/enums/PerformanceTrackerCategory.js';

import ParserDiagnostics from '../diagnostics/ParserDiagnostics.js';

import PacketCodec from '../schema/PacketCodec.js';

import DemoStreamBufferSplitter from '../stream/DemoStreamBufferSplitter.js';
import DemoStreamPacketCutter from '../stream/DemoStreamPacketCutter.js';
import DemoStreamPacketEditor from '../stream/DemoStreamPacketEditor.js';
import DemoStreamPacketExtractor from '../stream/DemoStreamPacketExtractor.js';
import DemoStreamPacketWriter from '../stream/DemoStreamPacketWriter.js';

import DemoCutIndex from './DemoCutIndex.js';

class Cutter {
    /** @private @type {PacketCodec} */
    _codec;

    /** @private @type {CutterConfiguration} */
    _configuration;

    /** @private @type {ParserDiagnostics} */
    _diagnostics;

    /** @private @type {DemoCutIndex|null} */
    _index = null;

    /** @private @type {Pipeline|null} */
    _pipeline = null;

    /**
     * @public
     * @constructor
     * @param {SchemaRegistry} registry
     * @param {CutterConfiguration} [configuration=CutterConfiguration.DEFAULT]
     * @param {Logger} [logger=Logger.CONSOLE_INFO]
     */
    constructor(registry, configuration = CutterConfiguration.DEFAULT, logger = Logger.CONSOLE_INFO) {
        Assert.isTrue(configuration instanceof CutterConfiguration, 'Invalid configuration: expected an instance of CutterConfiguration');
        Assert.isTrue(logger instanceof Logger, 'Invalid logger: expected an instance of Logger');

        this._configuration = configuration;

        this._codec = new PacketCodec(registry);
        this._diagnostics = new ParserDiagnostics(registry, logger);
    }

    /**
     * Reads the loaded demo once more and writes the packets of the window into a new demo.
     *
     * @public
     * @param {NodeReadable|ReadableStream} reader - The loaded demo.
     * @param {number} from - The first tick of the window.
     * @param {number} to - The last tick of the window.
     * @returns {Promise<Uint8Array>}
     */
    async cut(reader, from, to) {
        if (this._index === null) {
            throw new Error('Unable to cut: cutter is not loaded');
        }

        const chain = [
            new DemoStreamBufferSplitter(this._configuration, this._diagnostics),
            new DemoStreamPacketExtractor(this._configuration, this._diagnostics, DemoSource.REPLAY),
            new DemoStreamPacketCutter(this._configuration, this._index.getPlan(from, to)),
            new DemoStreamPacketEditor(this._configuration, this._codec)
        ];

        const writer = new DemoStreamPacketWriter(this._configuration);

        try {
            this._diagnostics.logger.info('Cut started');

            this._pipeline = new Pipeline(/** @type {*} */ (reader), chain, writer);

            await this._pipeline.ready();

            this._diagnostics.logger.info(`Cut [ ${writer.getBuffer().length} ] bytes`);

            return writer.getBuffer();
        } catch (error) {
            this._diagnostics.logger.error('Cut failed', error);

            throw error;
        } finally {
            this._pipeline = null;
        }
    }

    /**
     * Reads packet types and ticks. Payloads are not kept.
     *
     * @public
     * @param {NodeReadable|ReadableStream} reader
     * @param {DemoSource} [demoSource=DemoSource.REPLAY]
     * @returns {Promise<void>}
     */
    async load(reader, demoSource = DemoSource.REPLAY) {
        if (this._index !== null) {
            throw new Error('Unable to load: cutter is already loaded');
        }

        if (demoSource !== DemoSource.REPLAY) {
            throw new Error('Unable to load: unsupported demo source, only REPLAY is supported');
        }

        const collected = await this._extract(reader, demoSource);

        this._index = new DemoCutIndex(Uint8Array.from(collected.typeIds), Int32Array.from(collected.ticks));
    }

    /**
     * @private
     * @param {NodeReadable|ReadableStream} reader
     * @param {DemoSource} source
     * @returns {Promise<{ typeIds: Array<number>, ticks: Array<number> }>}
     */
    async _extract(reader, source) {
        /** @type {Array<number>} */
        const typeIds = [ ];

        /** @type {Array<number>} */
        const ticks = [ ];

        const chain = [
            new DemoStreamBufferSplitter(this._configuration, this._diagnostics),
            new DemoStreamPacketExtractor(this._configuration, this._diagnostics, source)
        ];

        try {
            this._diagnostics.logger.info('Extract started');

            this._diagnostics.performance.start(PerformanceTrackerCategory.PARSER);

            this._pipeline = new Pipeline(/** @type {*} */ (reader), chain, new WritableSink((packet) => {
                typeIds.push(packet.getTypeId());
                ticks.push(packet.tick.value);
            }));

            await this._pipeline.ready();

            this._diagnostics.logger.info(`Extracted [ ${typeIds.length} ] packets`);

            return { typeIds, ticks };
        } catch (error) {
            if (Pipeline.getIsAbortError(error)) {
                return { typeIds, ticks };
            }

            this._diagnostics.logger.error('Extract failed', error);

            throw error;
        } finally {
            this._diagnostics.performance.end(PerformanceTrackerCategory.PARSER);

            this._pipeline = null;
        }
    }
}

export default Cutter;
