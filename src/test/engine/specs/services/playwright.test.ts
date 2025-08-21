import assert from 'assert';
import { Browser, chromium } from 'playwright';
import * as sinon from 'sinon';

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

    it.skip('changes page when active target is switched', async () => {
        const page = await runtime.browser.newTab(runtime.browserContextId);
        await runtime.browser.attach(page.target.targetId);
        await runtime.goto('/select.html');

        const playwrightPage = runtime.playwright.getCurrentPage();
        assert(playwrightPage?.url, runtime.page.url());
        assert(playwrightPage?.title, runtime.page.target.title);
    });

    it('should establish only one connection and close existing connections', async () => {
        const browserMock = {
            on: sinon.stub(),
            close: sinon.stub().resolves(),
            contexts: sinon.stub().returns([]),
        };

        const connectOverCDPStub = sinon.stub(chromium, 'connectOverCDP').resolves(browserMock as unknown as Browser);
        sinon.stub(runtime.playwright, 'browser' as any).value(browserMock);

        const count = 10;
        await Promise.all(Array.from({ length: count }, async () => {
            await runtime.playwright.connectOverCDP();
        }));

        sinon.assert.callCount(browserMock.close, count);
        sinon.assert.callCount(connectOverCDPStub, count);

        connectOverCDPStub.restore();
        sinon.restore();
    });
});
