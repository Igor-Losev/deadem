/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */
/** @import DemoStreamPacketExtractor from './DemoStreamPacketExtractor.js' */

import Assert from '../core/Assert.js';
import BitWriter from '../core/BitWriter.js';

import Transform from '#core/stream/Transform.js';

import DemoFormat from '../data/DemoFormat.js';

import DemoPacketType from '../data/enums/DemoPacketType.js';

import DemoPacketRawReplayWriter from '../writers/DemoPacketRawReplayWriter.js';

/**
 * Writes a stream of {@link DemoPacketRaw} as a demo file.
 *
 * The counterpart of {@link DemoStreamPacketExtractor}.
 */
class DemoStreamPacketWriter extends Transform {
    /** @private @type {{ fileInfo: number, spawnGroups: number }} */
    _offsets = { fileInfo: 0, spawnGroups: 0 };

    /** @private @type {number} */
    _positionBytes = DemoFormat.REPLAY_HEADER_SIZE_BYTES;

    /**
     * @public
     * @returns {Uint8Array}
     */
    getHeader() {
        const writer = new BitWriter(DemoFormat.REPLAY_HEADER_SIZE_BYTES);

        writer.writeBytes(DemoFormat.STAMP);

        writer.writeUInt32(this._offsets.fileInfo);
        writer.writeUInt32(this._offsets.spawnGroups);

        return writer.getBuffer();
    }

    /**
     * @protected
     * @returns {Promise<void>}
     */
    async _finalize() {
        Assert.isTrue(this._offsets.fileInfo !== 0, 'Unable to finish the file: DEM_FileInfo is missing');
        Assert.isTrue(this._offsets.spawnGroups !== 0, 'Unable to finish the file: DEM_SpawnGroups is missing');
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        const sizeBytes = demoPacketRaw.getSize();
        const typeId = demoPacketRaw.getTypeId();

        if (typeId === DemoPacketType.DEM_FILE_INFO.id) {
            this._offsets.fileInfo = this._positionBytes;
        } else if (typeId === DemoPacketType.DEM_SPAWN_GROUPS.id) {
            this._offsets.spawnGroups = this._positionBytes;
        }

        if (this._positionBytes === DemoFormat.REPLAY_HEADER_SIZE_BYTES) {
            this._push(this.getHeader());
        }

        this._positionBytes += sizeBytes;

        this._push(DemoPacketRawReplayWriter.write(demoPacketRaw));
    }
}

export default DemoStreamPacketWriter;
