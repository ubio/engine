import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../model/index.js';

export class DomGetDocument extends Pipe {
    static $type = 'DOM.document';
    static override $help = `
Replace the DOM node of each input element with top #document node.

### Use For

- accessing elements outside of current DOM scope (e.g. inside \`each\` loop)
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const document = await this.$page.document();
        return await this.map(inputSet, async el => {
            return new Element(document, el.value);
        });
    }
}
