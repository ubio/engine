import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../model/index.js';

export class DomIframe extends Pipe {
    static $type = 'DOM.iframe';
    static override $help = `
Returns DOM contentDocument node of the IFRAME element.
An error is thrown if applied to non-frame elements.

### Use For

- accessing the contents of iframes
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return await this.map(inputSet, async el => {
            return await el.contentDocument();
        });
    }
}
