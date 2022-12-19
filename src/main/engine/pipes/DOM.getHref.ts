import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class DomHref extends Pipe {
    static $type = 'DOM.getHref';
    static override $help = `
Returns a fully resolved URL as specified by href attribute of \`<a>\` DOM elements (links).
An error is thrown if input element is not a link.

### Use For

- extracting absolute href value from links
`;

    @params.Boolean({
        help: 'Returns `null` instead of throwing error when input element is not a link.',
    })
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const optional = this.optional;

        return await this.map(inputSet, async el => {
            const href = await el.evaluateJson(el => el.href);
            util.assertPlayback(href || optional, 'Element does not contain href');
            return el.clone(href || null);
        });
    }
}
