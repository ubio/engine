import { Action } from '../action.js';
import { params } from '../model/index.js';
import { Pipeline } from '../pipeline.js';

export class DataComputeOutcome extends Action {
    static $type = 'Data.computeOutcome';
    static $icon = 'fas fa-microchip';
    static override $help = `
Computes a pipeline, storing a result which can subsequently be accessed
with \`Value.getOutcome\` pipe.
`;

    @params.Pipeline()
    pipeline!: Pipeline;

    @params.Outcome({
        label: 'Result',
        placeholder: 'Run the action to see the outcome value.',
    })
    $outcome: any = undefined;

    override reset() {
        super.reset();
        this.$outcome = undefined;
    }

    async exec() {
        await this.retry(async () => {
            const el = await this.selectOne(this.pipeline);
            this.$outcome = el.value;
        });
    }
}
