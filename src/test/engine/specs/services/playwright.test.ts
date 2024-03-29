import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('PlaywrightService', () => {
    it('is synced with internal CDP page after navigation', async () => {
        await runtime.goto('/index.html');
        const playwrightPage = runtime.playwright.getCurrentPage();
        const page = runtime.page;
        assert(playwrightPage?.url, page.url());
        assert(playwrightPage?.title, page.target.title);

        await playwrightPage.goto(runtime.getUrl('/new-tab.html'));
        assert(playwrightPage?.url, page.url());
        assert(playwrightPage?.title, page.target.title);
    });

    it('changes page when active target is switched', async () => {
        const page = await runtime.browser.newTab(runtime.browserContextId);
        await runtime.browser.attach(page.target.targetId);
        await runtime.goto('/select.html');

        const playwrightPage = runtime.playwright.getCurrentPage();
        assert(playwrightPage?.url, runtime.page.url());
        assert(playwrightPage?.title, runtime.page.target.title);
    });
});
