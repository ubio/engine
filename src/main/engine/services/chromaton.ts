import { inject, injectable } from 'inversify';

import { Target } from '../../cdp/index.js';
import { Logger } from '../../logger.js';
import { SessionHandler } from '../session.js';
import { BrowserService } from './browser.js';

/**
 * Applies script settings to Chromaton browsers.
 *
 * Other browsers do not support `Browser.configureChromaton`,
 * so there the settings are skipped with a warning.
 *
 * @internal
 */
@injectable()
@SessionHandler()
export class ChromatonService {
    mouseMovements: boolean | null = null;

    constructor(
        @inject(BrowserService)
        protected browser: BrowserService,
        @inject(Logger)
        protected logger: Logger,
    ) {
        browser.addTargetInit(target => this.initTarget(target));
    }

    async onSessionStart() {
        const isOverridden = this.mouseMovements != null;
        if (!isOverridden) {
            return;
        }
        // Workers reuse the browser, so the next job starts from launch defaults
        this.mouseMovements = null;
        await this.applyToAllTargets();
    }

    async setMouseMovements(enabled: boolean) {
        this.mouseMovements = enabled;
        await this.applyToAllTargets();
    }

    async applyToAllTargets() {
        for (const target of this.browser.attachedTargets()) {
            await this.applyToTarget(target);
        }
    }

    async initTarget(target: Target) {
        const isOverridden = this.mouseMovements != null;
        if (!isOverridden) {
            return;
        }
        await this.applyToTarget(target);
    }

    async applyToTarget(target: Target) {
        if (!target.isPageTarget()) {
            return;
        }
        const params = this.getConfigureParams();
        try {
            await target.send('Browser.configureChromaton', params);
        } catch (error: any) {
            this.logger.warn('Chromaton settings not applied', {
                params,
                error: error.message,
            });
        }
    }

    getConfigureParams() {
        if (this.mouseMovements == null) {
            return { reset: true };
        }
        return {
            settings: {
                mouseMovements: this.mouseMovements,
            },
        };
    }
}
