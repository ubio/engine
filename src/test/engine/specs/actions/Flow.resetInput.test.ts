import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Flow.resetInput', () => {
    it('returns resetInput', async () => {
        await runtime.runActions([
            {
                id: 'reset-input',
                type: 'Flow.resetInput',
                inputKey: 'foo',
            },
        ]);
        const input = runtime.flow.inputs.find(o => o.key === 'foo')!;
        assert.equal(input, null);
    });
});
