import diacritics from 'diacritics';

import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class RemoveDiacriticsPipe extends Pipe {
    static $type = 'String.removeDiacritics';
    static override $help = `
Replaces accented characters with their ASCII equivalent,
e.g. \`å\` becomes \`a\`, \`œ\` becomes \`oe\` and so on.

### Use For

- working with international text, especially in matching
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return this.map(inputSet, el => {
            util.checkType(el.value, 'string');
            const result = diacritics.remove(el.value);
            return el.clone(result);
        });
    }
}
