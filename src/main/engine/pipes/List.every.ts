import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe, Pipeline } from '../model/index.js';
import * as util from '../util/index.js';

export class ListEvery extends Pipe {
    static $type = 'List.every';
    static override $help = `
Returns a single #document element with boolean value.

The value is \`true\` if all of the results of inner pipeline is \`true\`.

Throws an error if the inner pipeline returns non-boolean value.
`;

    @params.Pipeline({ label: 'Value' })
    pipeline!: Pipeline;

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        const pipeline = this.pipeline;
        let result = true;
        for (const el of inputSet) {
            const res = await pipeline.selectOne([el], ctx);
            util.checkType(res.value, 'boolean');
            if (!res.value) {
                result = false;
                break;
            }
        }
        return [await this.createDocument(result)];
    }
}
