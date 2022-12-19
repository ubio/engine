import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../model/index.js';

export class ListExists extends Pipe {
    static $type = 'List.exists';
    static override $help = `
Returns a single element whose value is \`true\` if the input set contains one or more elements,
and \`false\` otherwise. The DOM node of the result is set to top #document.

### Use For

- checking if collection has elements (e.g. as part of filters or matchers)
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const value = inputSet.length > 0;
        const el = await this.createDocument(value);
        return [el];
    }
}
