import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Value.peekInput', () => {
    context('input exists', () => {
        it('returns input value', async () => {
            runtime.flow.inputs.push({
                key: 'foo',
                data: 'hello',
            });
            const results = await runtime.runPipes([
                {
                    type: 'Value.peekInput',
                    inputKey: 'foo',
                },
            ]);
            assert.equal(results.length, 1);
            assert.equal(results[0].description, '#document');
            assert.equal(results[0].value, 'hello');
        });
    });

    context('input does not exist', () => {
        it('returns null', async () => {
            const results = await runtime.runPipes([
                {
                    type: 'Value.peekInput',
                    inputKey: 'foo',
                },
            ]);
            assert.equal(results.length, 1);
            assert.equal(results[0].description, '#document');
            assert.equal(results[0].value, null);
        });
    });
});
