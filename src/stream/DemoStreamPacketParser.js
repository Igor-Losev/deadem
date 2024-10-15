const Stream = require('stream');

const protobuf = require('protobufjs'),
    snappy = require('snappy');

const BitBufferReader = require('./../definitions/BitBufferReader'),
    DemoPacketMessageParser = require('./../definitions/DemoPacketMessageParser'),
    VarInt32 = require('./../definitions/VarInt32');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('DemoStreamPacketParser');

class DemoStreamPacketParser extends Stream.Transform {
    constructor(protoPath) {
        super({ objectMode: true });

        this._counts = {
            packets: 0
        };

        this._proto = protobuf.loadSync(protoPath);
    }

    /**
     *
     * @param {DemoPacket} packet
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     * @private
     */
    _transform(packet, encoding, callback) {
        let payload;

        if (packet.getIsCompressed()) {
            payload = snappy.uncompressSync(packet.payload);
        } else {
            payload = packet.payload;
        }

        const messageType = packet.getMessageType();

        const EDemoCommands = this._proto.getEnum('EDemoCommands');

        logger.debug(`[ ${++this._counts.packets} ] - Tick: [ ${packet.tick.value} ], Command [ ${packet.command.value} ], MessageType: [ ${messageType} ], Size [ ${packet.payload.length} ], Compressed: [ ${packet.getIsCompressed()} ]`);

        switch (messageType) {
            case EDemoCommands.DEM_FileHeader: {
                const CDemoFileHeader = this._proto.lookupType('CDemoFileHeader');

                const fileHeader = CDemoFileHeader.decode(payload);

                logger.info(fileHeader);

                break;
            }
            case EDemoCommands.DEM_Packet:
            case EDemoCommands.DEM_SignonPacket: {
                const CDemoPacket = this._proto.lookupType('CDemoPacket');

                const { data } = CDemoPacket.decode(payload);

                if (packet.tick.value === 21) {
                    const parser = new DemoPacketMessageParser(data);

                    const messages = parser.getMessages();

                    console.log(messages);
                }

                // test(data);



                if (packet.tick.value === 27) {
                    throw new Error(111);
                }

                if (this._counts.packets === 5) {
                }

                break;
            }
            default: {
                break;
            }
        }

        callback();
    }
}

/**
 *
 * @param {Buffer} buffer
 */
function parseMessages(buffer) {
    const messages = [ ];

    const reader = new BitBufferReader(buffer);

    const readMessageType = () => {
        let candidate = this.readBits(6);

        switch (candidate & 48) {
            case 16:
                candidate = (candidate & 15) | (this.readBits(4) << 4);

                break;
            case 32:
                candidate = (candidate & 15) | (this.readBits(8) << 4);

                break;
            case 48:
                candidate = (candidate & 15) | (this.readBits(28) << 4);

                break;
            default:
                break;
        }

        return candidate;
    }

    const readMessageSize = () => {
        let parsed = null;

        let buffer = new Buffer(0);

        for (let i = 0; i < VarInt32.MAXIMUM_SIZE_BYTES && parsed === null; i++) {
            const byte = this.readBits(BITS_PER_BYTE);

            // console.log(`[ i: ${i} ] byte:`, byte);

            const suffix = new Buffer(1);

            suffix.writeUInt8(byte);

            const newBuffer = Buffer.concat([ buffer, suffix ]);

            buffer = newBuffer;

            // console.log(buffer);

            parsed = VarInt32.parse(buffer);
        }

        // console.log(parsed);

        return parsed;
    }

    const readMessagePayload = (size) => {
        let buffer = new Buffer(size);

        for (let i = 0; i < size; i++) {
            const byte = this.readBits(BITS_PER_BYTE);

            buffer.writeUInt8(byte, i);
        }

        return buffer;
    }
}

/**
 *
 * @param {Buffer} data
 */
function test(data) {
    const bitBuffer = new DemoBitBuffer(data);

    let mt;

    for (let i = 0; i < 10 && mt !== 0; i++) {
        mt = bitBuffer.readMessageType();
        const ms = bitBuffer.readMessageSize();
        const mp = bitBuffer.readMessagePayload(ms.value);

        // console.log(`[ ${i+1} ] Type:`, mt, `Size:`, ms.value, `Payload:`, mp.length);
    }
}

module.exports = DemoStreamPacketParser;
