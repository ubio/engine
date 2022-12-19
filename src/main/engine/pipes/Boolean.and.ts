import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import { Pipeline } from '../pipeline.js';
import * as util from '../util/index.js';

export class BooleanAnd extends Pipe {
    static $type = 'Boolean.and';
    static override $help = `
Evaluates two operands by passing each element of input set through two different pipelines,
then returns \`true\` if both operands are \`true\`, and \`false\` otherwise.

Inner pipelines should return a single element for each element in input set.
An error is thrown if the result is not a boolean.

### Use For

- combining multiple booleans using logical AND (conjunction)
`;

    @params.Pipeline({ label: 'Operand A' })
    pipelineA!: Pipeline;
    @params.Pipeline({ label: 'Operand B' })
    pipelineB!: Pipeline;

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        const pipelineA = this.pipelineA;
        const pipelineB = this.pipelineB;

        return await this.map(inputSet, async el => {
            const a = await pipelineA.selectOne([el], ctx);
            const b = await pipelineB.selectOne([el], ctx);
            util.checkType(a.value, 'boolean');
            util.checkType(b.value, 'boolean');
            const val = a.value && b.value;
            return el.clone(val);
        });
    }
}
