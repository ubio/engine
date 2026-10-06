import { inject, injectable } from 'inversify';
import fetch from 'node-fetch';
import { Browser, BrowserContext, chromium, ConnectOverCDPOptions, Page } from 'playwright';
import WebSocket from 'ws';

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
        if (this.browser) {
            await this.browser.close();
        }
        // macOS Chrome keeps the debug port after the last window closes.
        // Playwright 1.42 rejects the attach until a page target exists again.
        const createdTargetId = await this.ensurePageTarget();

        this.browser = await chromium.connectOverCDP(this.endpointUrl, options);
        this.browser.on('disconnected', async () => {
            await this.disconnect();
        });
        if (this.browser.contexts().length > 0) {
            this.context = this.browser.contexts()[0];
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
        return createdTargetId;
    }

    protected async ensurePageTarget(): Promise<string | undefined> {
        const response = await fetch(`${this.endpointUrl}/json/list`);
        const targets = await response.json();
        const hasPage = Array.isArray(targets) && targets.some(target => target.type === 'page');
        if (hasPage) {
            return;
        }
        return await this.createPageTarget();
    }

    protected createPageTarget(): Promise<string> {
        return new Promise((resolve, reject) => {
            fetch(`${this.endpointUrl}/json/version`)
                .then(response => response.json())
                .then(version => {
                    const ws = new WebSocket(version.webSocketDebuggerUrl);
                    const timer = setTimeout(() => {
                        ws.close();
                        reject(new Error('Timed out creating a page target'));
                    }, 8000);
                    ws.on('error', error => {
                        clearTimeout(timer);
                        reject(error);
                    });
                    ws.on('open', () => {
                        ws.send(JSON.stringify({
                            id: 1,
                            method: 'Target.createTarget',
                            params: { url: 'about:blank' },
                        }));
                    });
                    ws.on('message', data => {
                        const message = JSON.parse(data.toString());
                        if (message.id !== 1) {
                            return;
                        }
                        clearTimeout(timer);
                        ws.close();
                        if (message.error) {
                            reject(new Error(message.error.message));
                            return;
                        }
                        resolve(message.result.targetId);
                    });
                })
                .catch(reject);
        });
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
        let createdTargetId: string | undefined;
        if (!this.browser) {
            createdTargetId = await this.connectOverCDP();

            if (!this.context) {
                this.logger.warn(`Browser not running, failed to attach to ${targetId}`);
                return;
            }
        }

        const attached = await this.usePage(targetId);
        if (attached) {
            return;
        }
        if (createdTargetId) {
            const adopted = await this.usePage(createdTargetId);
            if (adopted) {
                return;
            }
        }

        this.logger.warn(`Failed to set current Playwright Page to ${targetId}`);
    }

    protected async usePage(targetId: string) {
        if (this.cachedPages.has(targetId)) {
            this.currentPage = this.cachedPages.get(targetId);
            return true;
        }
        const reversedPages = this.context!.pages().slice().reverse();
        for (const page of reversedPages) {
            const pageTargetId = await this.getPageTargetId(page);
            if (pageTargetId === targetId) {
                this.currentPage = page;
                return true;
            }
        }
        return false;
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
