import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../model/index.js';

export class ListReverse extends Pipe {
    static $type = 'List.reverse';
    static override $help = `
Returns the elements from the input set in a reversed order.

### Use For

- advanced scripting
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return inputSet.slice().reverse();
    }
}
