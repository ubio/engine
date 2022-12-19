import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Value.getInput', () => {
    it('returns input value', async () => {
        runtime.flow.inputs.push({
            key: 'foo',
            data: 'hello',
        });
        const results = await runtime.runPipes([
            {
                type: 'Value.getInput',
                inputKey: 'foo',
            },
        ]);
        assert.equal(results.length, 1);
        assert.equal(results[0].description, '#document');
        assert.equal(results[0].value, 'hello');
    });
});
