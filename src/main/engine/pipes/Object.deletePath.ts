import jsonPointer from 'jsonpointer';

import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';
import * as util from '../util/index.js';

export class ValueDeletePath extends Pipe {
    static $type = 'Object.deletePath';
    static override $help = `
Removes the value at specified path. An error is thrown if input value is not object/array.

### Use For

- removing unwanted or temporary data (e.g. for composing Job Output objects)

### See Also

- Compose: for shaping objects using bulk move operations
- Pick: for whitelisting object keys
`;

    @params.String({
        source: 'dataPaths',
        help: 'JSON pointer into input data, specifies which value to remove from the object.',
    })
    path: string = '';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const path = this.path;

        return await this.map(inputSet, async el => {
            util.checkType(el.value, ['object', 'array']);
            const newData = util.deepClone(el.value);
            jsonPointer.set(newData, path, undefined);
            return el.clone(newData);
        });
    }
}
