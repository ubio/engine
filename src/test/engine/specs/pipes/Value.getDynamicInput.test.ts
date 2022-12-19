import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Value.getDynamicInput', () => {
    it('returns input value', async () => {
        runtime.flow.inputs.push({
            key: 'foo-123',
            data: 'hello',
        });
        const results = await runtime.runPipes([
            {
                type: 'Value.getDynamicInput',
                pipeline: [
                    {
                        type: 'Value.getJson',
                        value: JSON.stringify('foo-123'),
                    },
                ],
            },
        ]);
        assert.equal(results.length, 1);
        assert.equal(results[0].description, '#document');
        assert.equal(results[0].value, 'hello');
    });
});
