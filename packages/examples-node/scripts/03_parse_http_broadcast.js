import { BroadcastAgent, BroadcastGateway, DemoSource, Logger, Parser, ParserConfiguration, Printer } from 'deadem';

(async () => {
    /**
     * Setup Instructions Before Running:
     *
     * 1. Visit: https://deadlocktracker.gg/live
     * 2. Find an ongoing match that has at least one spectator.
     * 3. Verify that the following endpoint returns valid JSON data:
     *    https://dist1-ord1.steamcontent.com/tv/{MATCH_ID}/sync
     * 4. Replace the MATCH_ID variable in your script with the ID of the selected match.
     */
    const FROM_BEGINNING = false;
    const MATCH_ID = 39056521;

    const broadcastGateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
    const broadcastAgent = new BroadcastAgent(broadcastGateway, MATCH_ID, Logger.CONSOLE_DEBUG);

    const parserConfiguration = new ParserConfiguration({ parserThreads: 3 });
    const parser = new Parser(parserConfiguration);
    const printer = new Printer(parser);

    await parser.parse(broadcastAgent.stream(FROM_BEGINNING), DemoSource.HTTP_BROADCAST);

    printer.printStats();
})();

