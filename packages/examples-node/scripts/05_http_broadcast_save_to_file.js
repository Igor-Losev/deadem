import { BroadcastAgent, BroadcastGateway, Logger } from 'deadem';

import FileSystem from 'deadem/src/core/FileSystem.js';

(async () => {
    const FROM_BEGINNING = true;
    const MATCH_ID = 38625795;

    const broadcastGateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
    const broadcastAgent = new BroadcastAgent(broadcastGateway, MATCH_ID, Logger.CONSOLE_DEBUG);

    const readable = broadcastAgent.stream(FROM_BEGINNING);
    const writable = FileSystem.createWriteStream(`./${MATCH_ID}.bin`);

    readable.pipe(writable);
})();

