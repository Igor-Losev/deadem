import TransformStream from '#core/stream/TransformStream.js';

/**
 * Assigns sequential {@link DemoPacketRaw#ordinal} values (0, 1, 2, ...)
 * to packets passing through the stream. This is used during replay
 * to ensure the {@link DemoStreamPacketCoordinator} can reorder packets
 * correctly, regardless of their original {@link DemoPacketRaw#sequence}.
 */
class DemoStreamPacketResequencer extends TransformStream {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super();

        this._engine = engine;
        this._ordinal = 0;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        demoPacketRaw.ordinal = this._ordinal;

        this._ordinal += 1;

        this._push(demoPacketRaw);
    }
}

export default DemoStreamPacketResequencer;
