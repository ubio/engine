import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../pipe.js';

export class ListLength extends Pipe {
    static $type = 'List.length';
    static override $help = `
Returns a single element whose value is a number of elements in the input set.

### Use For

- accessing the count of input elements (e.g. to output the number of available options on the website)
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const el = await this.createDocument(inputSet.length);
        return [el];
    }
}
