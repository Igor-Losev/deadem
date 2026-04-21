import EngineParser from '@deadem/engine/src/Parser.js';
import EnginePlayer from '@deadem/engine/src/Player.js';
import SchemaRegistry from '@deadem/engine/src/SchemaRegistry.js';

import Bootstrap from '#bootstrap/Bootstrap.js';

import ProtoProvider from '#providers/ProtoProvider.instance.js';

function createRegistry() {
    const registry = new SchemaRegistry(ProtoProvider);

    Bootstrap.run(registry);

    return registry;
}

class Parser extends EngineParser {
    /**
     * @constructor
     * @param {ParserConfiguration=} configuration
     * @param {Logger=} logger
     */
    constructor(configuration, logger) {
        super(createRegistry(), configuration, logger);
    }
}

class Player extends EnginePlayer {
    /**
     * @constructor
     * @param {ParserConfiguration=} configuration
     * @param {Logger=} logger
     */
    constructor(configuration, logger) {
        super(createRegistry(), configuration, logger);
    }
}

export { default as BroadcastAgent } from '@deadem/engine/src/broadcast/BroadcastAgent.js';
export { default as BroadcastGateway } from '@deadem/engine/src/broadcast/BroadcastGateway.js';
export { default as DeferredPromise } from '@deadem/engine/src/data/DeferredPromise.js';
export { default as DemoPacketType } from '@deadem/engine/src/data/enums/DemoPacketType.js';
export { default as DemoSource } from '@deadem/engine/src/data/enums/DemoSource.js';
export { default as EntityOperation } from '@deadem/engine/src/data/enums/EntityOperation.js';
export { default as InterceptorStage } from '@deadem/engine/src/data/enums/InterceptorStage.js';
export { default as Logger } from '@deadem/engine/src/core/Logger.js';
export { default as ParserConfiguration } from '@deadem/engine/src/ParserConfiguration.js';
export { default as PlaybackInterruptedError } from '@deadem/engine/src/errors/PlaybackInterruptedError.js';
export { default as PlayerState } from '@deadem/engine/src/data/enums/PlayerState.js';
export { default as Printer } from '@deadem/engine/src/Printer.js';
export { default as Protocol } from '@deadem/engine/src/data/enums/Protocol.js';

export { default as MessagePacketType } from './src/data/enums/MessagePacketType.js';
export { default as StringTableType } from './src/data/enums/StringTableType.js';

export { Parser, Player };
