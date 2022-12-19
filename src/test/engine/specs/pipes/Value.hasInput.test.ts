import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Value.hasInput', () => {
    context('input exists', () => {
        it('returns true', async () => {
            runtime.flow.inputs.push({
                key: 'foo',
                data: 'hello',
            });
            const results = await runtime.runPipes([
                {
                    type: 'Value.hasInput',
                    inputKey: 'foo',
                },
            ]);
            assert.equal(results.length, 1);
            assert.equal(results[0].description, '#document');
            assert.equal(results[0].value, true);
        });
    });

    context('input exists, but data is null', () => {
        it('still returns true', async () => {
            runtime.flow.inputs.push({
                key: 'foo',
                data: null,
            });
            const results = await runtime.runPipes([
                {
                    type: 'Value.hasInput',
                    inputKey: 'foo',
                },
            ]);
            assert.equal(results.length, 1);
            assert.equal(results[0].description, '#document');
            assert.equal(results[0].value, true);
        });
    });

    context('input does not exist', () => {
        it('returns false', async () => {
            const results = await runtime.runPipes([
                {
                    type: 'Value.hasInput',
                    inputKey: 'foo',
                },
            ]);
            assert.equal(results.length, 1);
            assert.equal(results[0].description, '#document');
            assert.equal(results[0].value, false);
        });
    });
});
