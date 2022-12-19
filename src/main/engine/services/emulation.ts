import { inject, injectable } from 'inversify';

import { Target } from '../../cdp/index.js';
import { Configuration, stringConfig } from '../../config.js';
import { Logger } from '../../logger.js';
import { SessionHandler } from '../session.js';
import { BrowserService } from './browser.js';

export type EmulationMode = 'disabled' | 'mobile' | 'desktop';

export const EMULATION_MODE = stringConfig('EMULATION_MODE', 'desktop');

/**
 * @internal
 */
@injectable()
@SessionHandler()
export class EmulationService {
    mode: EmulationMode;

    constructor(
        @inject(BrowserService)
        protected browser: BrowserService,
        @inject(Configuration)
        protected config: Configuration,
        @inject(Logger)
        protected logger: Logger,
    ) {
        browser.addTargetInit(target => this.applyToTarget(target));
        this.mode = this.getDefaultEmulationMode();
    }

    getDefaultEmulationMode() {
        return this.config.get(EMULATION_MODE) as EmulationMode;
    }

    async onSessionStart() {
        this.mode = this.getDefaultEmulationMode();
        await this.applyToAllTargets();
    }

    isEnabled(): boolean {
        return this.mode !== 'disabled';
    }

    async setMode(mode: EmulationMode) {
        this.mode = mode;
        await this.applyToAllTargets();
    }

    async applyToAllTargets() {
        for (const target of this.browser.attachedTargets()) {
            await this.applyToTarget(target);
        }
    }

    async applyToTarget(target: Target) {
        if (target.type !== 'page') {
            return;
        }
        if (this.mode === 'disabled') {
            await target.send('Emulation.clearDeviceMetricsOverride');
        } else {
            const emulationSettings = this.getEmulationSettings();
            await target.send('Emulation.setDeviceMetricsOverride', emulationSettings);
        }
    }

    getEmulationSettings() {
        switch (this.mode) {
            case 'desktop':
                return {
                    width: 1270,
                    height: 712,
                    deviceScaleFactor: 1,
                    mobile: false,
                    scale: 1,
                };
            case 'mobile':
                return {
                    width: 375,
                    height: 667,
                    deviceScaleFactor: 1,
                    mobile: true,
                    scale: 1,
                    screenWidth: 375,
                    screenHeight: 667,
                };
            default:
                return {};
        }
    }
}
