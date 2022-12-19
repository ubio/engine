import { Action } from '../action.js';
import { params } from '../model/index.js';
import { Pipeline } from '../pipeline.js';
// import * as util from '../util';
import { JsonSchema } from '../schema.js';
import { UserAgentService } from '../services/user-agent.js';

export class SetUserAgentAction extends Action {
    static $type = 'Page.setUserAgent';
    static $icon = 'fas fa-user-secret';
    static override $help = `
Overrides User Agent and Platform visible to web pages.
`;
    static override $schema: JsonSchema = {
        type: 'object',
        required: ['userAgent'],
        properties: {
            userAgent: { type: 'string' },
            platform: { type: 'string' },
        },
    };

    @params.Pipeline()
    pipeline: Pipeline = [
        {
            type: 'Value.getJson',
            value: JSON.stringify({
                userAgent: this.$userAgent.getDefaultUserAgent(),
                platform: this.$userAgent.getDefaultPlatform(),
            }, null, 2)
        }
    ] as any;

    override init(spec: any) {
        super.init(spec);
        const { userAgent, platform } = spec;
        if (userAgent || platform) {
            this.pipeline = new Pipeline(this, 'pipeline', [
                {
                    type: 'Value.getJson',
                    value: JSON.stringify({ userAgent, platform })
                }
            ]);
        }
    }

    get $userAgent() {
        return this.$container.get(UserAgentService);
    }

    async exec() {
        const el = await this.retry(() => this.selectOne(this.pipeline));
        const {
            userAgent = this.$userAgent.getDefaultUserAgent(),
            platform = this.$userAgent.getDefaultPlatform(),
        } = this.validate(el.value);
        await this.$userAgent.setUserAgent(userAgent, platform);
    }
}
