import Assert from '../core/Assert.js';
import Transform from '#core/stream/Transform.js';

import PerformanceTrackerCategory from '../data/enums/PerformanceTrackerCategory.js';

import ParserConfiguration from '../ParserConfiguration.js';
import ParserDiagnostics from '../ParserDiagnostics.js';

/**
 * Splits buffer into chunks with a maximum size of maxChunkSize (in bytes).
 */
class DemoStreamBufferSplitter extends Transform {
    /** @private @type {ParserDiagnostics} */
    _diagnostics;

    /** @private @type {number} */
    _maxChunkSize;

    /**
     * @public
     * @constructor
     * @param {ParserConfiguration} configuration
     * @param {ParserDiagnostics} diagnostics
     */
    constructor(configuration, diagnostics) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(diagnostics instanceof ParserDiagnostics, 'Invalid diagnostics: expected an instance of ParserDiagnostics');

        this._diagnostics = diagnostics;
        this._maxChunkSize = configuration.splitterChunkSize;
    }

    /**
     * @protected
     * @param {Buffer} chunk
     */
    async _handle(chunk) {
        if (chunk.byteLength <= this._maxChunkSize) {
            this._push(chunk);
        } else {
            for (let i = 0; i < Math.ceil(chunk.byteLength / this._maxChunkSize); i++) {
                this._diagnostics.performance.start(PerformanceTrackerCategory.DEMO_BUFFER_SPLITTER);

                const slice = chunk.subarray(i * this._maxChunkSize, (i + 1) * this._maxChunkSize);

                this._diagnostics.performance.end(PerformanceTrackerCategory.DEMO_BUFFER_SPLITTER);

                this._push(slice);
            }
        }
    }
}

export default DemoStreamBufferSplitter;
