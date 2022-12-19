import jsonPointer from 'jsonpointer';

import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class ValueHasPath extends Pipe {
    static $type = 'Object.hasPath';
    static override $help = `
Returns \`true\` if input object contains anything at specified path.
An error is thrown if input value is not an object or an array.

### Use For

- checking whether optional data is set (e.g. whether inbound flight object is specified)
`;

    @params.String({
        source: 'dataPaths',
        help: 'JSON pointer into input data.',
        showInHeader: true,
    })
    path: string = '';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const path = this.path;

        return this.map(inputSet, el => {
            util.checkType(el.value, ['object', 'array']);
            const data = jsonPointer.get(el.value, path);
            return el.clone(data != null);
        });
    }
}
