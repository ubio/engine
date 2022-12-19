import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe, Pipeline } from '../model/index.js';

export class ListSortBy extends Pipe {
    static $type = 'List.sortBy';
    static override $help = `
For each element evaluates the key using inner pipeline,
then sorts the elements according to this key, in ascending order.

### Use For

- advanced scripting
`;

    @params.Pipeline({
        label: 'Key',
        help: 'Inner pipeline to evaluate sorting key.',
    })
    pipeline!: Pipeline;

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        const pipeline = this.pipeline;
        const wraps = [];
        for (const el of inputSet) {
            const result = await pipeline.selectOne([el], ctx);
            const val = result.value;
            wraps.push({ el, val });
        }
        return wraps.sort((a, b) => (a.val > b.val ? 1 : -1)).map(w => w.el);
    }
}
