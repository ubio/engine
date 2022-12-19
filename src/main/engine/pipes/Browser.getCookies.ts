import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../model/index.js';

export class GetCookiesPipe extends Pipe {
    static $type = 'Browser.getCookies';
    static override $help = `
Obtains browser cookies and returns them as element values.
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const cookies = await this.$page.getAllCookies();
        const results = [];
        for (const el of inputSet) {
            for (const cookie of cookies) {
                results.push(el.clone(cookie));
            }
        }
        return results;
    }
}
