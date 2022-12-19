import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import { Pipeline } from '../pipeline.js';
import * as util from '../util/index.js';

export class GetInputDynamicPipe extends Pipe {
    static $type = 'Value.getDynamicInput';
    static override $help = `
Returns the value of specified Job Input.
The input key is evaluated using nested pipeline.
`;

    @params.Pipeline({
        label: 'Key',
        help: 'Pipeline for evaluating key, executed per each element.',
    })
    pipeline!: Pipeline;

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        const pipeline = this.pipeline;
        return await this.map(inputSet, async el => {
            const res = await pipeline.selectOne([el], ctx);
            util.checkType(res.value, 'string');
            const data = await this.$script.requestInput(res.value);
            return el.clone(data);
        });
    }
}
