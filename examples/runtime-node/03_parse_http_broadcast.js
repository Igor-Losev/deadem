import { BroadcastAgent, BroadcastGateway, DemoSource, Logger, Parser, ParserConfiguration, Printer } from '#root/index.js';

(async () => {
    const MATCH_ID = 38624662;

    const broadcastGateway = new BroadcastGateway('dist1-ord1.steamcontent.com/tv');
    const broadcastAgent = new BroadcastAgent(broadcastGateway, MATCH_ID, Logger.CONSOLE_DEBUG);

    const parserConfiguration = new ParserConfiguration({ parserThreads: 3 });
    const parser = new Parser(parserConfiguration);
    const printer = new Printer(parser);

    await parser.parse(broadcastAgent.stream(false), DemoSource.HTTP_BROADCAST);

    printer.printStats();
})();

