/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */
/** @import DemoStreamPacketExtractor from './DemoStreamPacketExtractor.js' */

import Assert from '../core/Assert.js';
import BitWriter from '../core/BitWriter.js';

import Writable from '#core/stream/Writable.js';

import StreamConfiguration from '../configurations/StreamConfiguration.js';

import DemoFormat from '../data/DemoFormat.js';

import DemoPacketType from '../data/enums/DemoPacketType.js';

import DemoPacketRawReplayWriter from '../writers/DemoPacketRawReplayWriter.js';

/**
 * Writes a stream of {@link DemoPacketRaw} into a buffer.
 *
 * The counterpart of {@link DemoStreamPacketExtractor}.
 */
class DemoStreamPacketWriter extends Writable {
    /** @private @type {Uint8Array|null} */
    _buffer = null;

    /** @private @type {Array<Uint8Array>} */
    _chunks = [ ];

    /** @private @type {{ fileInfo: number, spawnGroups: number }} */
    _offsets = { fileInfo: 0, spawnGroups: 0 };

    /** @private @type {number} */
    _positionBytes = DemoFormat.REPLAY_HEADER_SIZE_BYTES;

    /**
     * @public
     * @constructor
     * @param {StreamConfiguration} configuration
     */
    constructor(configuration) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof StreamConfiguration, 'Invalid configuration: expected an instance of StreamConfiguration');
    }

    /**
     * Returns the demo file once the stream has finished.
     *
     * @public
     * @returns {Uint8Array}
     */
    getBuffer() {
        Assert.isTrue(this._buffer !== null, 'Unable to get the buffer: the stream has not finished');

        return this._buffer;
    }

    /**
     * @protected
     * @returns {Promise<void>}
     */
    async _finalize() {
        Assert.isTrue(this._offsets.fileInfo !== 0, 'Unable to finish the file: DEM_FileInfo is missing');
        Assert.isTrue(this._offsets.spawnGroups !== 0, 'Unable to finish the file: DEM_SpawnGroups is missing');

        const writer = new BitWriter(this._positionBytes);

        writer.writeBytes(DemoFormat.STAMP);

        writer.writeUInt32(this._offsets.fileInfo);
        writer.writeUInt32(this._offsets.spawnGroups);

        for (let i = 0; i < this._chunks.length; i++) {
            writer.writeBytes(this._chunks[i]);
        }

        this._buffer = writer.getBuffer();
        this._chunks = [ ];
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        if (demoPacketRaw.is(DemoPacketType.DEM_FILE_INFO)) {
            this._offsets.fileInfo = this._positionBytes;
        } else if (demoPacketRaw.is(DemoPacketType.DEM_SPAWN_GROUPS)) {
            this._offsets.spawnGroups = this._positionBytes;
        }

        const chunk = DemoPacketRawReplayWriter.write(demoPacketRaw);

        this._chunks.push(chunk);

        this._positionBytes += chunk.length;
    }
}

export default DemoStreamPacketWriter;
