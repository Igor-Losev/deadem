/**
 * @template {string|null} [N=string|null]
 * @typedef {import('@deademx/engine').DemoPacket<Dota2Proto, N>} DemoPacket
 */
/** @typedef {import('@deademx/engine').DemoPacketObject} DemoPacketObject */
/** @typedef {import('@deademx/engine').DemoPacketRaw} DemoPacketRaw */
/** @typedef {import('@deademx/engine').EntityMutation} EntityMutation */
/** @typedef {import('@deademx/engine').InterceptorMap<Dota2Proto>} InterceptorMap */
/** @typedef {import('@deademx/engine').MemoryTrackerStats} MemoryTrackerStats */
/**
 * @template {string|null} [N=string|null]
 * @typedef {import('@deademx/engine').MessagePacket<Dota2Proto, N>} MessagePacket
 */
/** @typedef {import('@deademx/engine').MessagePacketObject} MessagePacketObject */
/** @typedef {import('@deademx/engine').PacketTrackerStats} PacketTrackerStats */
/** @typedef {import('@deademx/engine').ParserConfigurationOptions} ParserConfigurationOptions */
/** @typedef {import('@deademx/engine').PerformanceTrackerStats} PerformanceTrackerStats */
/** @typedef {import('@deademx/engine').PlaybackInterruptionReason} PlaybackInterruptionReason */
/** @typedef {import('@deademx/engine').ProtoState} ProtoState */
/** @typedef {import('@deademx/engine').StringTableDecoderFn} StringTableDecoderFn */
/** @typedef {import('@deademx/engine').SyncObject} SyncObject */

/** @import { CutterConfiguration, Logger, ParserConfiguration, PlayerConfiguration } from '@deademx/engine' */
/** @import { Dota2Proto } from '@deademx/dota2/proto' */

import {
    Cutter as EngineCutter,
    DemoPacket as EngineDemoPacket,
    MessagePacket as EngineMessagePacket,
    Parser as EngineParser,
    Player as EnginePlayer,
    SchemaRegistry
} from '@deademx/engine';

import Bootstrap from './src/bootstrap/Bootstrap.js';

import { descriptors } from './proto/generated/index.js';

function createRegistry() {
    const registry = new SchemaRegistry(descriptors);

    Bootstrap.run(registry);

    return registry;
}

/**
 * @extends {EngineParser<Dota2Proto>}
 */
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

/**
 * @extends {EnginePlayer<Dota2Proto>}
 */
class Player extends EnginePlayer {
    /**
     * @constructor
     * @param {(PlayerConfiguration|ParserConfiguration)=} configuration
     * @param {Logger=} logger
     */
    constructor(configuration, logger) {
        super(createRegistry(), configuration, logger);
    }
}

/**
 * @extends {EngineCutter}
 */
class Cutter extends EngineCutter {
    /**
     * @constructor
     * @param {CutterConfiguration=} configuration
     * @param {Logger=} logger
     */
    constructor(configuration, logger) {
        super(createRegistry(), configuration, logger);
    }
}

const DemoPacket = EngineDemoPacket;
const MessagePacket = EngineMessagePacket;

export {
    BroadcastAgent,
    BroadcastFragmentType,
    BroadcastGateway,
    Class,
    CutterConfiguration,
    Demo,
    DemoPacketType,
    DemoSource,
    Entity,
    EntityMutationEvent,
    EntityOperation,
    InterceptorStage,
    Logger,
    ParserConfiguration,
    PlaybackInterruptedError,
    PlayerConfiguration,
    PlayerState,
    Printer,
    Protocol,
    Server,
    StringTable,
    StringTableContainer,
    StringTableEntry,
    StringTableMutationEvent,
    StringTableOperation,
    UserCommand,
    UserCommandEvent
} from '@deademx/engine';

export { default as MessagePacketType } from './src/data/enums/MessagePacketType.js';
export { default as StringTableType } from './src/data/enums/StringTableType.js';

export { Cutter, DemoPacket, MessagePacket, Parser, Player };
