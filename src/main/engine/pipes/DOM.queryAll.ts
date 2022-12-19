import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';

export class DomQueryAll extends Pipe {
    static $type = 'DOM.queryAll';
    static override $help = `
Returns all Element nodes found by specified selector.

### Use For

- returning a group of elements (e.g. prices) for further manipulation (e.g. text parsing)

### See Also

- DOM.queryOne: for the equivalent pipe which returns a single node
`;

    @params.Selector({
        showInHeader: true,
    })
    selector: string = '';

    @params.Boolean({
        help: 'Produce 0 elements instead of throwing an error when no elements are found.',
    })
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const selector = this.selector;
        const optional = this.optional;

        return await this.map(inputSet, el => el.queryAll(selector, optional));
    }
}
