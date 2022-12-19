import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import { Pipeline } from '../pipeline.js';
import * as util from '../util/index.js';

export class ListFilter extends Pipe {
    static $type = 'List.filter';
    static override $help = `
For each input element evaluates the boolean value of inner pipeline.
The element is then discarded if the value is \`false\`, or kept if the value is \`true\`.

Inner pipeline must return a single element for each element in the input set.
An error is thrown if the resulting value is not a boolean.

### Use For

- general purpose filtering for various use cases
`;

    @params.Pipeline({
        label: 'Condition',
    })
    pipeline!: Pipeline;

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        const pipeline = this.pipeline;
        util.assertScript(pipeline.length, 'No pipes defined');
        const results = [];
        for (const el of inputSet) {
            const result = await pipeline.selectOne([el], ctx);
            util.checkType(result.value, 'boolean');
            if (result.value) {
                results.push(el);
            }
        }
        return results;
    }
}
