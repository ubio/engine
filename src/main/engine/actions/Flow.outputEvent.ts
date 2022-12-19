import { Action, params, Pipeline } from '../model/index.js';
import * as util from '../util/index.js';

export class OutputEvent extends Action {
    static $type = 'Flow.outputEvent';
    static $icon = 'fas fa-share';
    static override $help = `
Emits a Job Event Output with \`type\` and other arbitrary properties. The output key looks like \`events:<random-id>\`.

The pipeline can return a single element with \`type: string\` and other data fields.
If \`type\` is omitted, it will use the predefined type field. Note that evaluated value from pipeline will take precedence over predefined value.
`;

    @params.String({ label: 'Type' })
    eventType: string = '';

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
            const value = el.value ?? {};
            util.checkType(value, 'object', 'value');
            const data = {
                type: this.eventType,
                ...value,
            };
            util.assertPlayback(!!data.type, 'type should be a non-empty string');
            util.checkType(data.type, 'string', 'type');
            this.$output = data;
            this.$outputKey = this.$script.hashInputOutputKey(`events:${Math.random()}`);
            await this.$script.sendOutput(this.$outputKey, data);
        });
    }
}
