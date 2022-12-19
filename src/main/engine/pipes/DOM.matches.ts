import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';

export class DomMatchesSelector extends Pipe {
    static $type = 'DOM.matches';
    static override $help = `
Returns \`true\` if element matches specifed selector.
`;

    @params.Selector({
        showInHeader: true,
    })
    selector: string = '';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return await this.map(inputSet, async el => {
            const val = await el.remote.matches(this.selector);
            return el.clone(val);
        });
    }
}
