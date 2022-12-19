import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class ObjectEntries extends Pipe {
    static $type = 'Object.entries';
    static override $help = `
Converts each object into \`[key, value]\` pairs for each property.

Throws an error if element value is not an object.
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return this.map(inputSet, el => {
            const results: Element[] = [];
            const obj = el.value;
            util.checkType(obj, 'object');
            for (const entry of Object.entries(obj)) {
                results.push(el.clone(entry));
            }
            return results;
        });
    }
}
