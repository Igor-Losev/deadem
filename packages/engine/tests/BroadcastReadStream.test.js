import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Logger from '../src/core/Logger.js';

import BroadcastAgent from '../src/broadcast/BroadcastAgent.js';
import BroadcastGateway from '../src/broadcast/BroadcastGateway.js';
import BroadcastReadStreamBrowser from '../src/broadcast/BroadcastReadStream.browser.js';
import BroadcastReadStreamNode from '../src/broadcast/BroadcastReadStream.node.js';

function createAgent() {
    const gateway = Object.create(BroadcastGateway.prototype);

    gateway.getSync = vi.fn(async () => ({ fragment: 100, signup_fragment: 1 }));
    gateway.getFragment = vi.fn(async () => new Uint8Array(1));

    return { agent: new BroadcastAgent(gateway, 1, Logger.NOOP), gateway };
}

describe('BroadcastReadStream', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('It should stop the agent when the Node.js stream is destroyed', async () => {
        const { agent, gateway } = createAgent();
        const stream = new BroadcastReadStreamNode(agent);

        agent.start();

        await vi.advanceTimersByTimeAsync(3000);

        stream.destroy();

        const requests = gateway.getFragment.mock.calls.length;

        await vi.advanceTimersByTimeAsync(10000);

        expect(agent.finished).toBe(true);
        expect(gateway.getFragment.mock.calls.length).toBe(requests);
    });

    test('It should stop the agent when the web stream is cancelled', async () => {
        const { agent, gateway } = createAgent();
        const stream = new BroadcastReadStreamBrowser(agent);

        agent.start();

        await vi.advanceTimersByTimeAsync(3000);

        await stream.cancel();

        const requests = gateway.getFragment.mock.calls.length;

        await vi.advanceTimersByTimeAsync(10000);

        expect(agent.finished).toBe(true);
        expect(gateway.getFragment.mock.calls.length).toBe(requests);
    });
});
