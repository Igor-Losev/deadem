import Assert from '#core/Assert.js';
import Gate from '#core/Gate.js';

class ReadableArrayBrowser extends ReadableStream {
    /**
     * @public
     * @constructor
     * @param {Array<*>} array
     * @param {boolean} [gated=false]
     */
    constructor(array, gated = false) {
        Assert.isTrue(Array.isArray(array), 'array must be an array');

        const state = {
            array,
            destroyed: false,
            gate: gated ? new Gate() : null,
            index: 0
        };

        super({
            async pull(controller) {
                if (state.destroyed || state.index >= state.array.length) {
                    controller.close();

                    return;
                }

                if (state.gate !== null) {
                    try {
                        await state.gate.acquire();
                    } catch {
                        return;
                    }
                }

                if (state.destroyed) {
                    return;
                }

                if (state.index < state.array.length) {
                    controller.enqueue(state.array[state.index++]);
                } else {
                    controller.close();
                }
            }
        });

        this._state = state;
    }

    /**
     * Destroys the stream, releasing the array and unblocking any pending pull().
     *
     * @public
     */
    destroy() {
        this._state.destroyed = true;
        this._state.array = [];

        if (this._state.gate !== null) {
            this._state.gate.destroy();
        }
    }

    /**
     * Releases the next item in the stream.
     * Only works when the stream is created with `gated=true`.
     *
     * @public
     */
    release() {
        if (this._state.gate === null) {
            throw new Error('release() can only be called on a gated ReadableArray');
        }

        this._state.gate.release();
    }
}

export default ReadableArrayBrowser;
