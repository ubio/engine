import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import { Pipeline } from '../pipeline.js';

export class ListPrepend extends Pipe {
    static $type = 'List.prepend';
    static override $help = `
Concatenates the output set of inner pipeline with the input set.
The input set comes after the inner pipeline's results.

Note: the inner pipeline is executed only once (as opposed to other pipelines
which are executed per each element in input set), with #document element as its input set.
A typical usage is to have a Use Definition pipe inside of it,
so that multiple definitions can be concatenated together.

### Use For

- concatenating elements from multiple definitions or other sources

### See Also

- Append: for similar functionality with different order of elements
`;

    @params.Pipeline({ label: 'Prepended set' })
    pipeline!: Pipeline;

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        const pipeline = this.pipeline;
        const scope = await this.createDocument();
        const otherSet = await pipeline.selectAll([scope], ctx);
        return otherSet.concat(inputSet);
    }
}
