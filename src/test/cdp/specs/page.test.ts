import { assert, assertError, runtime } from '../globals.js';

describe('Page', () => {
    describe('navigate', () => {
        it('navigates to page', async () => {
            await runtime.goto('/index.html');
            const url = runtime.page.url();
            assert(url.startsWith(runtime.baseUrl));
            assert(url.endsWith('/index.html'));
        });

        it('fails on network error', async () => {
            await assertError('NavigationFailed', async () => {
                await runtime.page.navigate('http://localhost:3008/');
            });
        });

        it('fails on HTTP errors', async () => {
            await assertError('NavigationFailed', async () => {
                await runtime.goto('/index.html?status=400');
            });
        });

        it('fails on timeout', async () => {
            const timeout = 500;
            await assertError('NavigationTimeout', async () => {
                await runtime.goto('/index.html?delay=1000', { timeout });
            });
        });
    });

    describe('getLayoutMetrics', () => {
        it('returns layout metrics', async () => {
            await runtime.goto('/index.html');
            const metrics = await runtime.page.getLayoutMetrics();
            assert(metrics.layoutViewport.clientWidth > 0);
            assert(metrics.layoutViewport.clientHeight > 0);
            assert(metrics.visualViewport.clientWidth > 0);
            assert(metrics.visualViewport.clientHeight > 0);
            assert(metrics.contentSize.width > 0);
            assert(metrics.contentSize.height > 0);
        });
    });

    describe('htmlSnapshot', () => {
        it('returns html snapshot', async () => {
            await runtime.goto('/index.html');
            const html = await runtime.page.grabHtmlSnapshot();
            assert(html.includes('<html>'));
            assert(html.includes('<h1 id="hello">'));
        });
    });

    describe('document', () => {
        it('retrieves top-page document after navigation', async () => {
            await runtime.goto('/index.html');
            const document = await runtime.page.document();
            assert.equal(document.description, '#document');
        });
    });
});
