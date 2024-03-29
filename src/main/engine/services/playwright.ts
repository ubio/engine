import { inject, injectable } from 'inversify';
import { Browser, BrowserContext, chromium, ConnectOverCDPOptions, Page } from 'playwright';

import { Configuration } from '../../config.js';
import { Logger } from '../../logger.js';
import { CHROME_ADDRESS, CHROME_PORT } from './browser.js';

@injectable()
export class PlaywrightService {
    protected browser?: Browser;
    protected context?: BrowserContext;
    protected targetId?: string;
    protected currentPage?: Page;
    protected cachedPages = new Map<string, Page>();
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
        this.browser.on('disconnected', async () => {
            await this.disconnect();
        });
        this.context = this.browser.contexts()[0];
        if (this.context) {
            this.context.on('page', async page => {
                const pageTargetId = await this.getPageTargetId(page);
                if (pageTargetId) {
                    this.cachedPages.set(pageTargetId, page);
                    page.on('close', async page => {
                        for (const [key, value] of this.cachedPages) {
                            if (value === page) {
                                this.cachedPages.delete(key);
                            }
                        }
                    });
                }
            });

            await this.fillCacheForAllPages(this.context.pages());
            if (!this.targetId) {
                this.currentPage = this.context.pages()[0];
            } else {
                this.currentPage = this.cachedPages.get(this.targetId);
            }
        }
    }

    async disconnect() {
        await this.browser?.close();
        this.browser = undefined;
        this.context = undefined;
        this.currentPage = undefined;
        this.targetId = undefined;
        this.cachedPages.clear();
    }

    protected async fillCacheForAllPages(pages: Page[]) {
        for (const page of pages) {
            const pageTargetId = await this.getPageTargetId(page);
            if (pageTargetId) {
                this.cachedPages.set(pageTargetId, page);
            }
        }
    }

    async setCurrentPage(targetId: string) {
        this.currentPage = undefined;
        this.targetId = targetId;
        if (!this.browser) {
            await this.connectOverCDP();

            if (!this.context) {
                this.logger.warn(`Browser not running, failed to attach to ${targetId}`);
                return;
            }
        }

        if (this.cachedPages.has(targetId)) {
            this.currentPage = this.cachedPages.get(targetId);
            return;
        }

        const reversedPages = this.context!.pages().slice().reverse();
        for (const page of reversedPages) {
            const pageTargetId = await this.getPageTargetId(page);
            if (pageTargetId === targetId) {
                this.currentPage = page;
                return;
            }
        }

        this.logger.warn(`Failed to set current Playwright Page to ${targetId}`);
    }

    protected async getPageTargetId(page: Page) {
        let targetId = null;
        try {
            const session = await page.context().newCDPSession(page);
            const { targetInfo } = await session.send('Target.getTargetInfo');
            await session.detach();
            targetId = targetInfo.targetId;
        } catch (error) {
            this.logger.warn(`Failed to get page target ID`, error);
        }

        return targetId;
    }

    getCurrentPage() {
        return this.currentPage;
    }
}
