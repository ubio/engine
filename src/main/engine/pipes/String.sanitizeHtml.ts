import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class ValueSanitizeHtml extends Pipe {
    static $type = 'String.sanitizeHtml';
    static override $help = `
Takes input string containing HTML markup and removes unsafe tags
(e.g. \`<script>\`) and attributes (e.g. \`onclick\`).

An error is thrown if input value is not a string.

### Use For

- pre-processing
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return this.map(inputSet, el => {
            util.checkType(el.value, 'string');
            const cleanHtml = util.sanitizeHtml(el.value);
            return el.clone(cleanHtml);
        });
    }
}
