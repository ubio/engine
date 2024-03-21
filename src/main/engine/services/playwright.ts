import { inject, injectable } from 'inversify';
import { Browser, chromium, ConnectOverCDPOptions, Page } from 'playwright';

import { Logger } from '../../logger.js';

@injectable()
export class PlaywrightService {
    protected browser?: Browser;
    protected currentPage?: Page;

    constructor(
        @inject(Logger)
        protected logger: Logger,
    ) {
    }

    async connectOverCDP(endpointURL: string, options?: ConnectOverCDPOptions) {
        this.browser = await chromium.connectOverCDP(endpointURL, options);
        const firstContext = this.browser.contexts()[0];
        this.currentPage = firstContext.pages()[0];
    }

    async setCurrentPage(targetId: string) {
        if (this.getContext()) {
            for (const page of this.getContext()!.pages()) {
                const session = await page.context().newCDPSession(page);
                const { targetInfo } = await session.send('Target.getTargetInfo');
                await session.detach();
                if (targetInfo.targetId === targetId) {
                    this.currentPage = page;
                    return;
                }
            }
        }

        this.logger.warn(`Failed to set current Playwright Page to ${targetId}`);
    }

    async getCurrentPage() {
        return this.currentPage;
    }

    protected getContext() {
        // in our environment there should be just 1 browser window per app
        return this.browser?.contexts()[0];
    }
}
