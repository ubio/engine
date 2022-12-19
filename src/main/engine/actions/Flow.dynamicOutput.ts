import { Action, params, Pipeline } from '../model/index.js';
import * as util from '../util/index.js';

export class DynamicOutput extends Action {
    static $type = 'Flow.dynamicOutput';
    static $icon = 'fas fa-share';
    static override $help = `
Sends a dynamic Job Output, with both \`key\` and \`data\` being evaluated at runtime
rather than pre-defined at scripting time.

The pipeline should return a single element with \`key: string\` and \`data: any\`.
`;

    @params.Pipeline()
    pipeline!: Pipeline;

    @params.Outcome({
        label: 'Result',
        placeholder: 'Run the action to see the output value.',
        outputKeyProp: '$outputKey',
    })
    $output: any = undefined;

    // This is needed so that output validation works
    $outputKey: string = '';

    override reset() {
        super.reset();
        this.$output = undefined;
        this.$outputKey = '';
    }

    async exec() {
        await this.retry(async () => {
            const el = await this.selectOne(this.pipeline);
            util.checkType(el.value, 'object', 'value');
            const { key, data } = el.value;
            util.assertPlayback(!!key, 'Key should be a non-empty string');
            util.assertPlayback(data !== undefined, 'Data should exist');
            util.checkType(key, 'string', 'value.key');
            this.$output = data;
            this.$outputKey = this.$script.hashInputOutputKey(key);
            await this.$script.sendOutput(key, data);
        });
    }
}
