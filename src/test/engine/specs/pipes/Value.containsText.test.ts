import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Pipes: value/contains-text', () => {
    it('returns true if value contains text', async () => {
        const results = await runtime.runPipes([
            {
                type: 'Value.getConstant',
                value: 'Hello World',
            },
            {
                type: 'Value.containsText',
                text: 'world',
            },
        ]);
        assert.equal(results.length, 1);
        assert.equal(results[0].description, '#document');
        assert.equal(results[0].value, true);
    });

    it('returns false if value does not contain text', async () => {
        const results = await runtime.runPipes([
            {
                type: 'Value.getConstant',
                value: 'Hello World',
            },
            {
                type: 'Value.containsText',
                text: 'world1',
            },
        ]);
        assert.equal(results.length, 1);
        assert.equal(results[0].description, '#document');
        assert.equal(results[0].value, false);
    });
});
