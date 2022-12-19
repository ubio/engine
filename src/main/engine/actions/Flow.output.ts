import { Action, params, Pipeline } from '../model/index.js';
import * as util from '../util/index.js';

export class FlowOutput extends Action {
    static $type = 'Flow.output';
    static $icon = 'fas fa-share';
    static override $help = `
Sends Job Output with specified Output Key.

The pipeline should return a single element.
Its value will be sent as output data.

Note: multiple elements are not automatically serialized to arrays;
use Fold Array to send arrays instead.
`;

    @params.String({ source: 'outputs' })
    outputKey: string = '';

    @params.Pipeline()
    pipeline!: Pipeline;

    @params.Outcome({
        label: 'Result',
        placeholder: 'Run the action to see the output value.',
        outputKeyProp: 'outputKey',
    })
    $output: any = undefined;

    override getLabel() {
        return this.outputKey;
    }

    override reset() {
        super.reset();
        this.$output = undefined;
    }

    override *collectOutputKeys(): IterableIterator<string> {
        yield this.outputKey;
    }

    async exec() {
        util.assertScript(this.outputKey, 'Output key is not specified');
        await this.retry(async () => {
            const el = await this.selectOne(this.pipeline);
            this.$output = el.value;
            await this.$script.sendOutput(this.outputKey, el.value);
        });
    }
}
