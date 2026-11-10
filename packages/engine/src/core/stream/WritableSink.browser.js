class WritableSinkBrowser extends WritableStream {
    /**
     * @public
     * @constructor
     * @param {((chunk: *) => *)|null} [onWrite=null] - Optional callback invoked for each chunk. A returned promise is awaited.
     */
    constructor(onWrite = null) {
        super({
            async write(chunk) {
                if (onWrite !== null) {
                    await onWrite(chunk);
                }
            }
        });
    }
}

export default WritableSinkBrowser;
