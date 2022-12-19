import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';
import * as util from '../util/index.js';

export class DomAttribute extends Pipe {
    static $type = 'DOM.getAttribute';

    static override $help = `
Returns the value of specified DOM attribute.
An error is thrown if attribute does not exist on one of the input elements.

### Use For

- extracting information from DOM attributes
    `;

    @params.String({
        source: 'attributes',
        help: 'Name of the attribute.',
        showInHeader: true,
    })
    attribute: string = '';

    @params.Boolean({
        help: 'Return `null` instead of throwing an error if attribute does not exist.',
    })
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const attrName = this.attribute;
        const optional = this.optional;

        return await this.map(inputSet, async el => {
            const { attributes } = await el.getInfo();
            const attrValue = attributes[attrName];
            util.assertPlayback(attrValue || optional, `Attribute ${attrName} not found`);
            return el.clone(attrValue || null);
        });
    }
}
