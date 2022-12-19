import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';

export class DomClosest extends Pipe {
    static $type = 'DOM.closest';
    static override $help = `
Returns the closest ancestor of an element matching specified selector.
Throws an error if no such element is found.
`;

    @params.Selector({
        showInHeader: true,
    })
    selector: string = '';

    @params.Boolean({
        help: 'Omit an element if no matching ancestor is found.',
    })
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const selector = this.selector;
        const optional = this.optional;

        return await this.map(inputSet, el => el.closest(selector, optional));
    }
}
