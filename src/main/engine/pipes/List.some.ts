import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import { Pipeline } from '../pipeline.js';
import * as util from '../util/index.js';

export class ListSome extends Pipe {
    static $type = 'List.some';
    static override $help = `
Returns a single #document element with boolean value.

The value is \`true\` if at least one result of inner pipeline is \`true\`.

Throws an error if the inner pipeline returns non-boolean value.
`;

    @params.Pipeline({ label: 'Value' })
    pipeline!: Pipeline;

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        const pipeline = this.pipeline;
        let result = false;
        for (const el of inputSet) {
            const res = await pipeline.selectOne([el], ctx);
            util.checkType(res.value, 'boolean');
            if (res.value) {
                result = true;
                break;
            }
        }
        return [await this.createDocument(result)];
    }
}
