class EventLoopNode {
    /**
     * @public
     * @static
     * @returns {Promise<void>}
     */
    static yield() {
        return new Promise((resolve) => {
            setImmediate(resolve);
        });
    }
}

export default EventLoopNode;
