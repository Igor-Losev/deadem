import Assert from '#core/Assert.js';
import Semaphore from '#core/Semaphore.js';

class ReadableArrayBrowser extends ReadableStream {
    /**
     * @public
     * @constructor
     * @param {Array<*>} array
     * @param {boolean} [gated=false]
     */
    constructor(array, gated = false) {
        Assert.isTrue(Array.isArray(array), 'array must be an array');

        const semaphore = gated ? new Semaphore(0) : null;

        let index = 0;

        super({
            async pull(controller) {
                if (index >= array.length) {
                    controller.close();

                    return;
                }

                if (semaphore) {
                    await semaphore.acquire();
                }

                if (index < array.length) {
                    controller.enqueue(array[index++]);
                } else {
                    controller.close();
                }
            }
        });

        this._semaphore = semaphore;
    }

    /**
     * Releases the next item in the stream.
     * Only works when the stream is created with `gated=true`.
     *
     * @public
     */
    release() {
        if (this._semaphore === null) {
            throw new Error(`release() can only be called on a gated ReadableArray`);
        }

        this._semaphore.release();
    }
}

export default ReadableArrayBrowser;
