const STAMP = new TextEncoder().encode('PBDEMS2\0');

/**
 * Constants of the demo container format.
 */
class DemoFormat {
    static get COMPRESSED_FLAG() { return 64; }
    static get INITIAL_TICK() { return -1; }
    static get REPLAY_HEADER_SIZE_BYTES() { return 16; }
    static get STAMP() { return STAMP; }
}

export default DemoFormat;
