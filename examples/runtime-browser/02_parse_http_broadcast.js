import { BroadcastAgent, BroadcastGateway, DemoSource, InterceptorStage, Logger, Parser, ParserConfiguration, Printer, Protocol } from '#root/index.js';

const MATCH_ID = 38624662;

const input = document.getElementById('input');
const output = document.getElementById('output');
const submit = document.getElementById('submit');

input.remove();
submit.remove();
output.innerText = 'See console...';

const broadcastGateway = new BroadcastGateway('localhost:5173/tv', Protocol.HTTP);
const broadcastAgent = new BroadcastAgent(broadcastGateway, MATCH_ID, Logger.CONSOLE_DEBUG);

const parserConfiguration = new ParserConfiguration({ parserThreads: 3 });
const parser = new Parser(parserConfiguration);
const printer = new Printer(parser);

parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, (demoPacket) => {
    console.log(demoPacket.type.code);
});

await parser.parse(broadcastAgent.stream(false), DemoSource.HTTP_BROADCAST);

printer.printStats();

