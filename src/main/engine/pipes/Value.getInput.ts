import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';

export class ValueGetInput extends Pipe {
    static $type = 'Value.getInput';
    static override $help = `
Returns the value of specified Job Input.

### Use For

- accessing Job Inputs for further manipulation (e.g. filter by Job Input value)
`;

    @params.String({
        source: 'inputs',
        showInHeader: true,
    })
    inputKey: string = '';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const inputKey = this.inputKey;
        const data = await this.$script.requestInput(inputKey);
        return this.map(inputSet, el => {
            return el.clone(data);
        });
    }
}
