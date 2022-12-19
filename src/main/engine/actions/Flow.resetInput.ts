import { Action } from '../action.js';
import { params } from '../model/index.js';
import * as util from '../util/index.js';

export class FlowResetInput extends Action {
    static $type = 'Flow.resetInput';
    static $icon = 'fas fa-undo';
    static override $help = `
Resets Job Input with specified Input key.
`;

    @params.String({ source: 'inputs' })
    inputKey: string = '';

    async exec() {
        util.assertScript(this.inputKey, 'Input key is not specified');
        await this.retry(async () => {
            await this.$script.resetInput(this.inputKey);
        });
    }
}
