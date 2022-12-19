import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('DOM.shadowRoot', () => {

    it('allows searching elements inside shadow root', async () => {
        await runtime.goto('/shadow.html');
        // Note: we run the pipeline without retry, so let's wait for the page to load
        await runtime.page.waitForLoad();
        const results = await runtime.runPipes([
            {
                type: 'DOM.queryOne',
                selector: '#shadow',
            },
            {
                type: 'DOM.shadowRoot',
            },
            {
                type: 'DOM.queryOne',
                selector: 'h1',
            },
        ]);
        assert.equal(results.length, 1);
        assert.equal(results[0].description, 'h1');
    });

    it('throws if element contains no shadow root', async () => {
        await runtime.goto('/shadow.html');
        // Note: we run the pipeline without retry, so let's wait for the page to load
        await runtime.page.waitForLoad();
        await runtime.assertError('DomManipulationError', async () => {
            await runtime.runPipes([
                {
                    type: 'DOM.queryOne',
                    selector: '#other',
                },
                {
                    type: 'DOM.shadowRoot',
                }
            ]);
        });
    });

});
