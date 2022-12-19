import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';
import * as util from '../util/index.js';

export class ValueParseColor extends Pipe {
    static $type = 'String.parseColor';
    static override $help = `
Parses color value from input string, returning detailed information about color,
including its rgb, hsv, hsl values.
`;

    @params.Boolean({
        help: 'Return `null` instead of throwing if color cannot be parsed.',
    })
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const optional = this.optional;
        return this.map(inputSet, el => {
            util.checkType(el.value, 'string');
            const color = util.parseColor(el.value);
            util.assertPlayback(color || optional, 'Color parsing failed');
            return el.clone(color);
        });
    }
}
