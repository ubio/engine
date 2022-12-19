import { inject, injectable } from 'inversify';

import {
    booleanConfig,
    Browser,
    Configuration,
    Logger,
    numberConfig,
    Page,
    stringConfig,
} from '../../cdp/index.js';
import { Exception } from '../../exception.js';
import { util } from '..';
import { SessionHandler } from '../session.js';

const CDP_TIMEOUT = numberConfig('CDP_TIMEOUT', 120000);
const NAVIGATION_TIMEOUT = numberConfig('NAVIGATION_TIMEOUT', 30000);
const CHROME_PORT = numberConfig('CHROME_PORT', 9123);
const CHROME_ADDRESS = stringConfig('CHROME_ADDRESS', '127.0.0.1');
const SUSPEND_TARGETS = booleanConfig('SUSPEND_TARGETS', true);

@injectable()
@SessionHandler()
export class BrowserService extends Browser {
    private _currentPage: Page | null = null;

    constructor(
        @inject(Logger)
        logger: Logger,
        @inject(Configuration)
        protected _config: Configuration,
    ) {
        super({ logger });
        this.syncConfig();
    }

    async onSessionStart() {
        // Note: don't remove interceptors here, because other components
        // may add them, resulting in race conditions
    }

    async onSessionFinish() {
        this.clearInterceptors();
    }

    syncConfig() {
        this.applyConfig({
            chromeAddress: this._config.get(CHROME_ADDRESS),
            chromePort: this._config.get(CHROME_PORT),
            cdpTimeout: this._config.get(CDP_TIMEOUT),
            navigationTimeout: this._config.get(NAVIGATION_TIMEOUT),
            suspendTargets: this._config.get(SUSPEND_TARGETS),
        });
    }

    getChromePort() {
        return this._config.get(CHROME_PORT);
    }

    async attach(targetId: string): Promise<void> {
        this.detach();
        this._currentPage = await this.getPage(targetId);
        if (!this._currentPage) {
            throw new Exception({
                name: 'AttachFailed',
                message: 'Could not attach to specified target',
                retry: true,
            });
        }
        this.emit('attached');
    }

    isAttached(): boolean {
        return !!this._currentPage;
    }

    isAttachedTo(targetId: string): boolean {
        if (!this._currentPage) {
            return false;
        }
        return this._currentPage.target.targetId === targetId;
    }

    detach(): void {
        if (!this.isAttached()) {
            return;
        }
        this.emit('willDetach');
        this._currentPage = null;
        this.emit('detached');
    }

    get page() {
        util.assertPlayback(this._currentPage, `No attached targets`);
        return this._currentPage!;
    }

    getCurrentPage() {
        return this._currentPage;
    }

    async openNewTab() {
        const tab = await this.newTab();
        await this.attach(tab.target.targetId);
    }

    async closeOtherTabs() {
        const currentTarget = this.page.target;
        const pages = [...this.attachedPages()];
        for (const page of pages) {
            if (page.target.targetId !== currentTarget.targetId && page.target.type === 'page') {
                page.close();
            }
        }
    }
}
