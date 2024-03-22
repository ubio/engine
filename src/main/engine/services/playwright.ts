import { inject, injectable } from 'inversify';
import { Browser, chromium, ConnectOverCDPOptions, Page } from 'playwright';

import { Configuration } from '../../config.js';
import { Logger } from '../../logger.js';
import { CHROME_ADDRESS, CHROME_PORT } from './browser.js';

@injectable()
export class PlaywrightService {
    protected browser?: Browser;
    protected currentPage?: Page;
    protected endpointUrl: string;

    constructor(
        @inject(Logger)
        protected logger: Logger,
        @inject(Configuration)
        protected config: Configuration,
    ) {
        this.endpointUrl = `http://${this.config.get(CHROME_ADDRESS)}:${this.config.get(CHROME_PORT)}`;
    }

    async connectOverCDP(options?: ConnectOverCDPOptions) {
        this.browser = await chromium.connectOverCDP(this.endpointUrl, options);
        this.currentPage = this.getContext()?.pages()[0];
    }

    async setCurrentPage(targetId: string) {
        if (!this.getContext()) {
            await this.connectOverCDP();
        }

        for (const page of this.getContext()!.pages()) {
            const session = await page.context().newCDPSession(page);
            const { targetInfo } = await session.send('Target.getTargetInfo');
            await session.detach();
            if (targetInfo.targetId === targetId) {
                this.currentPage = page;
                return;
            }
        }

        this.logger.warn(`Failed to set current Playwright Page to ${targetId}`);
    }

    getCurrentPage() {
        return this.currentPage;
    }

    protected getContext() {
        // in our environment there should be just 1 browser window per app
        return this.browser?.contexts()[0];
    }
}
