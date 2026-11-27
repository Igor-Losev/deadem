/** @import { NodeReadable } from '#core/stream/Pipeline.js' */
/** @import ConsoleCommand from '../data/ConsoleCommand.js' */
/** @import DemoCutIndex from './DemoCutIndex.js' */
/** @import SchemaRegistry from '../schema/SchemaRegistry.js' */

import Assert from '../core/Assert.js';
import Logger from '../core/Logger.js';
import Pipeline from '#core/stream/Pipeline.js';

import CutterConfiguration from '../configurations/CutterConfiguration.js';

import DemoSource from '../data/enums/DemoSource.js';
import PerformanceTrackerCategory from '../data/enums/PerformanceTrackerCategory.js';

import ParserDiagnostics from '../diagnostics/ParserDiagnostics.js';

import PacketCodec from '../schema/PacketCodec.js';

import DemoStreamBufferSplitter from '../stream/DemoStreamBufferSplitter.js';
import DemoStreamPacketExtractor from '../stream/DemoStreamPacketExtractor.js';
import DemoStreamPacketWriter from '../stream/DemoStreamPacketWriter.js';

import DemoStreamCutEditor from '../stream/cut/DemoStreamCutEditor.js';
import DemoStreamCutIndexer from '../stream/cut/DemoStreamCutIndexer.js';

class Cutter {
    /** @private @type {PacketCodec} */
    _codec;

    /** @private @type {CutterConfiguration} */
    _configuration;

    /** @private @type {ParserDiagnostics} */
    _diagnostics;

    /** @private @type {DemoCutIndex|null} */
    _index = null;

    /** @private @type {boolean} */
    _indexing = false;

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
     * Reads the indexed demo once more and writes the packets of the window into a new demo.
     *
     * @public
     * @param {NodeReadable|ReadableStream} reader - The indexed demo.
     * @param {number} from - The first tick of the window.
     * @param {number} to - The last tick of the window.
     * @param {Array<ConsoleCommand>} [commands=[ ]] - Console commands inserted at the start of the window.
     * @returns {Promise<Uint8Array>}
     */
    async cut(reader, from, to, commands = [ ]) {
        Assert.exists(reader, 'Invalid reader: expected a readable stream');

        if (this._index === null) {
            throw new Error('Unable to cut: cutter is not indexed');
        }

        const plan = this._index.getPlan(from, to, commands);

        const chain = [
            new DemoStreamBufferSplitter(this._configuration, this._diagnostics),
            new DemoStreamPacketExtractor(this._configuration, this._diagnostics, DemoSource.REPLAY),
            new DemoStreamCutEditor(this._configuration, plan, this._codec)
        ];

        const writer = new DemoStreamPacketWriter(this._configuration);

        try {
            this._diagnostics.logger.info('Cut started');

            const pipeline = new Pipeline(/** @type {*} */ (reader), chain, writer);

            await pipeline.ready();

            this._diagnostics.logger.info(`Cut [ ${writer.getBuffer().length} ] bytes`);

            return writer.getBuffer();
        } catch (error) {
            this._diagnostics.logger.error('Cut failed', error);

            throw error;
        }
    }

    /**
     * Reads packet types and ticks, and the string tables before every full packet. Payloads are not kept.
     *
     * @public
     * @param {NodeReadable|ReadableStream} reader
     * @param {DemoSource} [demoSource=DemoSource.REPLAY]
     * @returns {Promise<void>}
     */
    async index(reader, demoSource = DemoSource.REPLAY) {
        Assert.exists(reader, 'Invalid reader: expected a readable stream');

        if (this._index !== null) {
            throw new Error('Unable to index: cutter is already indexed');
        }

        if (this._indexing) {
            throw new Error('Unable to index: cutter is already indexing');
        }

        if (demoSource !== DemoSource.REPLAY) {
            throw new Error('Unable to index: unsupported demo source, only REPLAY is supported');
        }

        const indexer = new DemoStreamCutIndexer(this._configuration, this._codec);

        const chain = [
            new DemoStreamBufferSplitter(this._configuration, this._diagnostics),
            new DemoStreamPacketExtractor(this._configuration, this._diagnostics, demoSource),
            indexer
        ];

        this._indexing = true;

        try {
            this._diagnostics.logger.info('Indexing started');

            this._diagnostics.performance.start(PerformanceTrackerCategory.PARSER);

            const pipeline = new Pipeline(/** @type {*} */ (reader), chain);

            await pipeline.ready();

            this._index = indexer.getIndex();

            this._diagnostics.logger.info(`Indexed [ ${this._index.length} ] packets`);
        } catch (error) {
            this._diagnostics.logger.error('Indexing failed', error);

            throw error;
        } finally {
            this._indexing = false;

            this._diagnostics.performance.end(PerformanceTrackerCategory.PARSER);
        }
    }
}

export default Cutter;
