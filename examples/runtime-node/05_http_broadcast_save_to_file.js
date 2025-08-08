import { BroadcastAgent, BroadcastGateway, Logger } from '#root/index.js';

import FileSystem from '#core/FileSystem.js';

(async () => {
    const MATCH_ID = 38625795;

    const broadcastGateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
    const broadcastAgent = new BroadcastAgent(broadcastGateway, MATCH_ID, Logger.CONSOLE_DEBUG);

    const readable = broadcastAgent.stream(true);
    const writable = FileSystem.createWriteStream(`./${MATCH_ID}.bin`);

    readable.pipe(writable);
})();

