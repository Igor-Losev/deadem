class WritableSinkBrowser extends WritableStream {
    /**
     * @public
     * @constructor
     * @param {(function(*): void)|null} [onWrite=null] - Optional callback invoked for each chunk.
     */
    constructor(onWrite = null) {
        super({
            write(chunk) {
                if (onWrite !== null) {
                    onWrite(chunk);
                }
            }
        });
    }
}

export default WritableSinkBrowser;
