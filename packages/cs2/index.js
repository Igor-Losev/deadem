import {
    Parser as EngineParser,
    Player as EnginePlayer,
    SchemaRegistry
} from '@deademx/engine';

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

export {
    BroadcastAgent,
    BroadcastGateway,
    DemoPacketType,
    DemoSource,
    EntityOperation,
    InterceptorStage,
    Logger,
    ParserConfiguration,
    PlaybackInterruptedError,
    PlayerState,
    Printer,
    Protocol
} from '@deademx/engine';

export { default as MessagePacketType } from './src/data/enums/MessagePacketType.js';
export { default as StringTableType } from './src/data/enums/StringTableType.js';

export { Parser, Player };
