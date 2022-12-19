import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Flow.checkpoint', () => {
    it('creates a checkpoint', async () => {
        await runtime.goto('/index.html');
        await runtime.runActions([
            {
                type: 'Flow.checkpoint',
            },
        ]);
        const checkpoint = runtime.$checkpoints.checkpoint!;
        assert.ok(checkpoint);
        assert(checkpoint.url.endsWith('/index.html'));
        assert(Array.isArray(checkpoint.cookies));
    });
});
