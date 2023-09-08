import { inject, injectable } from 'inversify';

import { Target } from '../../cdp/index.js';
import { Configuration } from '../../config.js';
import { Logger } from '../../logger.js';
import { SessionHandler } from '../session.js';
import { BrowserService } from './browser.js';

@injectable()
@SessionHandler()
export class UserAgentService {
    userAgent: string | null = null;
    platform: string | null = null;

    constructor(
        @inject(BrowserService)
        protected browser: BrowserService,
        @inject(Configuration)
        protected config: Configuration,
        @inject(Logger)
        protected logger: Logger,
    ) {
        browser.addTargetInit(target => this.applyToTarget(target));
    }

    async onSessionStart() {
        this.userAgent = this.getDefaultUserAgent();
        this.platform = this.getDefaultPlatform();
        await this.applyToAllTargets();
    }

    async setUserAgent(userAgent: string, platform: string) {
        this.userAgent = userAgent;
        this.platform = platform;
        this.applyToAllTargets();
    }

    async applyToAllTargets() {
        for (const target of this.browser.attachedTargets()) {
            await this.applyToTarget(target);
        }
    }

    async applyToTarget(target: Target): Promise<void> {
        if (target.isPageTarget() && this.userAgent && this.platform) {
            const { userAgent, platform } = this;
            await target.send('Network.setUserAgentOverride', { userAgent, platform });
            await target.send('Emulation.setUserAgentOverride', { userAgent, platform }).catch(() => {});
        }
    }

    getDefaultUserAgent() {
        return null;
    }

    getDefaultPlatform() {
        return null;
    }
}
