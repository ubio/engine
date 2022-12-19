import jsonPointer from 'jsonpointer';

import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';

export class ObjectWrap extends Pipe {
    static $type = 'Object.wrap';
    static override $help = `
Returns a new object with input value placed at specified path.

### Use For

- creating objects out of other value types for further manipulation
- collecting data from multiple sources
`;

    @params.String({
        help: 'JSON pointer into newly created object, where input value is to be written.',
    })
    path: string = '';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const path = this.path;
        return this.map(inputSet, el => {
            const newData = {};
            jsonPointer.set(newData, path, el.value);
            return el.clone(newData);
        });
    }
}
