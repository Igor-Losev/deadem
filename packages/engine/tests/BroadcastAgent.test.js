import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Logger from '../src/core/Logger.js';

import BroadcastAgent from '../src/broadcast/BroadcastAgent.js';
import BroadcastGateway from '../src/broadcast/BroadcastGateway.js';

function createGateway(getFragment) {
    const gateway = Object.create(BroadcastGateway.prototype);

    gateway.getSync = vi.fn(async () => ({ fragment: 100, signup_fragment: 1 }));
    gateway.getFragment = vi.fn(getFragment);

    return gateway;
}

describe('BroadcastAgent', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('It should stop polling after stop', async () => {
        const gateway = createGateway(async () => new Uint8Array(1));
        const agent = new BroadcastAgent(gateway, 1, Logger.NOOP);
        const chunks = [ ];

        agent.subscribe(chunk => chunks.push(chunk));
        agent.start();

        await vi.advanceTimersByTimeAsync(3000);

        agent.stop();

        const requests = gateway.getFragment.mock.calls.length;

        await vi.advanceTimersByTimeAsync(10000);

        expect(gateway.getFragment.mock.calls.length).toBe(requests);
        expect(chunks.indexOf(null)).toBe(chunks.length - 1);
    });

    test('It should end the stream when the gateway keeps failing', async () => {
        const gateway = createGateway(async () => {
            throw new Error('offline');
        });
        const agent = new BroadcastAgent(gateway, 1, Logger.NOOP);
        const chunks = [ ];

        agent.subscribe(chunk => chunks.push(chunk));
        agent.start();

        await vi.advanceTimersByTimeAsync(60000);

        expect(chunks).toEqual([ null ]);
        expect(agent.finished).toBe(true);
    });
});
