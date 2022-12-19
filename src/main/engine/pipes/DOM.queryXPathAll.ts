import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';

export class DomQueryXpathAll extends Pipe {
    static $type = 'DOM.queryXPathAll';
    static override $help = `
Returns all Element nodes found by specified Xpath expression.

### Use For

- returning a group of elements (e.g. prices) for further manipulation (e.g. text parsing)

### See Also

- DOM.queryXPathOne: for the equivalent pipe which returns a single node
`;

    @params.String({
        showInHeader: true,
    })
    expression: string = '';

    @params.Boolean({
        help: 'Produce 0 elements instead of throwing an error when no elements are found.',
    })
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const expression = this.expression;
        const optional = this.optional;
        return await this.map(inputSet, el => el.queryXPathAll(expression, optional));
    }
}
