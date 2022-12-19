import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';
import * as util from '../util/index.js';

export class ValueContainsText extends Pipe {
    static $type = 'Value.containsText';
    static override $help = `
Returns \`true\` if input value contains specified string constant.
Non-string values are coerced to strings and are tested according to rules specified in Contains.

### Parameters

- text: string constant to test the input value against

### Use For

- creating matchers where matching text partially is preferred
- general purpose string containment tests against string constant
`;

    @params.String({
        showInHeader: true,
    })
    text: string = '';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const text = this.text;

        return this.map(inputSet, el => {
            return el.clone(util.strContains(el.value, text));
        });
    }
}
