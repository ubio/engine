import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Pipes: dom/iframe', () => {

    it('returns iframe document', async () => {
        await runtime.goto('/iframes/top.html');
        // Note: we run the pipeline without retry, so let's wait for the page to load
        await runtime.page.waitForLoad({ timeout: 3000 });
        const results = await runtime.runPipes([
            {
                type: 'DOM.queryOne',
                selector: '#frame1',
            },
            {
                type: 'DOM.iframe',
            },
        ]);
        assert.equal(results.length, 1);
        assert.equal(results[0].description, '#document');
    });

    it('throws if element is not iframe', async () => {
        await runtime.goto('/iframes/top.html');
        await runtime.page.waitForLoad({ timeout: 3000 });
        await runtime.assertError('DomManipulationError', async () => {
            await runtime.runPipes([
                {
                    type: 'DOM.queryOne',
                    selector: 'html',
                },
                {
                    type: 'DOM.iframe',
                },
            ]);
        });
    });
});
