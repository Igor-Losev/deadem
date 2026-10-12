/** @type {Array<() => void>} */
const queue = [];

const channel = new MessageChannel();

channel.port1.onmessage = () => {
    const resolve = queue.shift();

    if (resolve !== undefined) {
        resolve();
    }
};

class EventLoopBrowser {
    /**
     * @public
     * @static
     * @returns {Promise<void>}
     */
    static yield() {
        return new Promise((resolve) => {
            queue.push(resolve);

            channel.port2.postMessage(null);
        });
    }
}

export default EventLoopBrowser;
