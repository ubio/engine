import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Pipes: dom/text', () => {
    it('returns text', async () => {
        await runtime.goto('/buttons.html');
        const results = await runtime.runPipes([
            {
                type: 'DOM.queryOne',
                selector: 'h1',
            },
            {
                type: 'DOM.getText',
            },
        ]);
        assert.equal(results.length, 1);
        assert.equal(results[0].description, 'h1');
        assert.equal(results[0].value, 'Your language is: English');
    });
});
