import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import { Pipeline } from '../pipeline.js';
import * as util from '../util/index.js';

export class ListTakeWhile extends Pipe {
    static $type = 'List.takeWhile';
    static override $help = `
Starting in specified direction, takes input elements whilst inner pipeline produces \`true\`, and discards the rest.

Unlike Filter, which discards all non-matching elements, this pipe
only discards a continuous sequence of elements either at the start or at the end.

### See Also

- Skip While: for opposite effect.
`;

    @params.Pipeline({ label: 'Condition' })
    pipeline!: Pipeline;

    @params.Enum({
        enum: [
            { label: 'left to right', value: 'ltr' },
            { label: 'right to left', value: 'rtl' },
        ],
    })
    direction: string = 'ltr';

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        const pipeline = this.pipeline;
        const direction = this.direction;
        const rtl = direction === 'rtl';
        util.assertScript(pipeline.length, 'No pipes defined');
        const results = [];
        const collection = rtl ? inputSet.slice().reverse() : inputSet;
        for (const el of collection) {
            const result = await pipeline.selectOne([el], ctx);
            util.checkType(result.value, 'boolean');
            if (result.value) {
                results.push(el);
            } else {
                break;
            }
        }
        return rtl ? results.reverse() : results;
    }
}
