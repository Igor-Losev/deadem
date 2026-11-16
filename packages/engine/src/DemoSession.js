/** @import DemoPacketRaw from './data/DemoPacketRaw.js' */
/** @import StringTableMutationEvent from './data/tables/string/StringTableMutationEvent.js' */

import Assert from './core/Assert.js';

import Demo from './data/Demo.js';
import InterceptorRegistry from './data/InterceptorRegistry.js';

import ParserDiagnostics from './diagnostics/ParserDiagnostics.js';

import DemoEntityHandler from './handlers/DemoEntityHandler.js';
import DemoMessageHandler from './handlers/DemoMessageHandler.js';
import DemoPacketHandler from './handlers/DemoPacketHandler.js';
import StringTableHandler from './handlers/StringTableHandler.js';

import DemoPacketApplier from './processing/DemoPacketApplier.js';
import DemoPacketParser from './processing/DemoPacketParser.js';
import DemoPacketPrioritizer from './processing/DemoPacketPrioritizer.js';
import DemoPacketProcessor from './processing/DemoPacketProcessor.js';

import PacketCodec from './schema/PacketCodec.js';
import SchemaRegistry from './schema/SchemaRegistry.js';

import ParserConfiguration from './ParserConfiguration.js';

class DemoSession {
    /** @private @type {Demo} */
    _demo;

    /** @private @type {DemoPacketProcessor} */
    _processor;

    /** @private @type {StringTableHandler} */
    _stringTableHandler;

    /**
     * @public
     * @param {SchemaRegistry} registry
     * @param {ParserConfiguration} configuration
     * @param {ParserDiagnostics} diagnostics
     * @param {InterceptorRegistry} interceptors
     */
    constructor(registry, configuration, diagnostics, interceptors) {
        Assert.isTrue(registry instanceof SchemaRegistry, 'Invalid registry: expected an instance of SchemaRegistry');
        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(diagnostics instanceof ParserDiagnostics, 'Invalid diagnostics: expected an instance of ParserDiagnostics');
        Assert.isTrue(interceptors instanceof InterceptorRegistry, 'Invalid interceptors: expected an instance of InterceptorRegistry');

        this._demo = new Demo();
        this._stringTableHandler = new StringTableHandler(registry, this._demo.stringTableContainer, diagnostics.logger);

        const demoEntityHandler = new DemoEntityHandler(this._demo);
        const demoMessageHandler = new DemoMessageHandler(registry, this._demo, this._stringTableHandler, configuration.entityClassFilter);
        const demoPacketHandler = new DemoPacketHandler(registry, this._demo, this._stringTableHandler);

        this._processor = new DemoPacketProcessor(
            new DemoPacketParser(configuration, diagnostics, new PacketCodec(registry)),
            new DemoPacketPrioritizer(diagnostics),
            new DemoPacketApplier(diagnostics, demoPacketHandler, demoMessageHandler, demoEntityHandler, interceptors)
        );
    }

    /**
     * @public
     * @returns {Demo}
     */
    get demo() {
        return this._demo;
    }

    /**
     * Reads the string tables of a `DEM_FULL_PACKET` snapshot. Does not change the tables.
     *
     * @public
     * @param {*} snapshotData
     * @returns {Array<StringTableMutationEvent>}
     */
    extractStringTableSnapshot(snapshotData) {
        return this._stringTableHandler.extractSnapshot(snapshotData);
    }

    /**
     * Applies a packet to the demo.
     *
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @param {Array<StringTableMutationEvent>|null} [snapshotEvents=null] - String table snapshots of a seek. Applied before the messages.
     */
    process(demoPacketRaw, snapshotEvents = null) {
        this._processor.process(demoPacketRaw, snapshotEvents);
    }

    /**
     * Prepares the state for a new run: clears the demo and restarts the packet numbering.
     *
     * @public
     */
    reset() {
        this._demo.reset();
        this._processor.reset();
    }
}

export default DemoSession;
