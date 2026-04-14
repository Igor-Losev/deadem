import { BroadcastAgent, BroadcastGateway, DemoSource, Logger, Parser, ParserConfiguration, Printer } from 'deadem';

(async () => {
    /**
     * Setup Instructions Before Running:
     *
     * 1. Find a valid match identifier (connection target).
     *    One of the ways to obtain it is via the Deadlock developer console
     *    while connected to a server.
     *
     * 2. Verify that the following endpoint returns valid data:
     *    https://dist1-ord1.steamcontent.com/tv/{MATCH_IDENTIFIER}/sync
     *
     * 3. Replace MATCH_ID in your script with the obtained identifier.
     */
    const FROM_BEGINNING = false;
    const MATCH_ID = '75637129_201673668';

    const broadcastGateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
    const broadcastAgent = new BroadcastAgent(broadcastGateway, MATCH_ID, Logger.CONSOLE_DEBUG);

    const parserConfiguration = new ParserConfiguration({ parserThreads: 3 });
    const parser = new Parser(parserConfiguration);

    const printer = new Printer(parser);

    await parser.parse(broadcastAgent.stream(FROM_BEGINNING), DemoSource.HTTP_BROADCAST);

    printer.printStats();
})();

