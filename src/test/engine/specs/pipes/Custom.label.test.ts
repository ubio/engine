import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Pipes: other/label', () => {
    it('executes inner pipeline', async () => {
        const result = await runtime.runPipes([
            {
                type: 'Custom.label',
                pipeline: {
                    pipes: [{ type: 'Value.getConstant', value: 'hi' }],
                },
            },
        ]);
        assert.equal(result.length, 1);
        assert.equal(result[0].value, 'hi');
    });
});
