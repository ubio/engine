import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../pipe.js';

export class DomIframe extends Pipe {
    static $type = 'DOM.shadowRoot';
    static override $help = `
Obtains shadow DOM root of the current element.
An error is thrown if element has no shadow root.
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return await this.map(inputSet, async el => {
            return await el.shadowRoot();
        });
    }
}
