import { inject, injectable } from 'inversify';

import { Target } from '../../cdp/index.js';
import { booleanConfig, Configuration, stringConfig } from '../../config.js';
import { Logger } from '../../logger.js';
import { SessionHandler } from '../session.js';
import { BrowserService } from './browser.js';

const UA_OVERRIDE_ENABLED = booleanConfig('UA_OVERRIDE_ENABLED', true);
const USER_AGENT = stringConfig(
    'USER_AGENT',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/86.0.4240.198 Safari/537.36',
);
const USER_AGENT_PLATFORM = stringConfig('USER_AGENT_PLATFORM', 'Win32');

@injectable()
@SessionHandler()
export class UserAgentService {
    userAgent: string;
    platform: string;

    constructor(
        @inject(BrowserService)
        protected browser: BrowserService,
        @inject(Configuration)
        protected config: Configuration,
        @inject(Logger)
        protected logger: Logger,
    ) {
        this.userAgent = this.getDefaultUserAgent();
        this.platform = this.getDefaultPlatform();
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
        if (!this.isEnabled()) {
            return;
        }
        if (target.isPageTarget()) {
            const { userAgent, platform } = this;
            await target.send('Network.setUserAgentOverride', { userAgent, platform });
            await target.send('Emulation.setUserAgentOverride', { userAgent, platform }).catch(() => {});
        }
    }

    getDefaultUserAgent() {
        return this.config.get(USER_AGENT);
    }

    getDefaultPlatform() {
        return this.config.get(USER_AGENT_PLATFORM);
    }

    isEnabled() {
        return this.config.get(UA_OVERRIDE_ENABLED);
    }

}
