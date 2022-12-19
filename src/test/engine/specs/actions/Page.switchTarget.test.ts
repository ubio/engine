import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Page.switchTarget', () => {
    it('switches active target', async () => {
        await runtime.goto('/new-tab.html');
        await runtime.runActions([
            {
                type: 'Page.click',
                pipeline: {
                    pipes: [{ type: 'DOM.queryOne', selector: 'a' }],
                },
            },
            // {
            //     type: 'Flow.sleep',
            //     timeout: 2000,
            // },
            {
                type: 'Page.switchTarget',
                closeOthers: true,
                pipeline: {
                    pipes: [
                        {
                            type: 'Browser.selectTargets',
                            pathnameRegexp: '^/$',
                            hostnameRegexp: 'localhost.*',
                        }
                    ],
                },
            },
        ]);
        assert(runtime.page.url().endsWith('/'));
        const h1 = await runtime.page.querySelector('h1');
        const { text } = await h1!.getInfo();
        assert.equal(text, 'Welcome!');
    });
});
