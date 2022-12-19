import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class ValueParseNumber extends Pipe {
    static $type = 'String.parseNumber';
    static override $help = `
Parses a number value from input string.

An error is thrown if input value is not a string.

### Use For

- parsing numbers obtained from string representation (e.g. from web page attribute)
  for subsequent use with other numeric pipes
`;

    @params.Boolean()
    float: boolean = false;
    @params.Boolean()
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const optional = this.optional;

        return this.map(inputSet, el => {
            util.checkType(el.value, 'string');
            let num: number | null = this.float ? parseFloat(el.value) : parseInt(el.value, 10);
            if (isNaN(num)) {
                num = null;
            }
            util.assertPlayback(num != null || optional, 'Number parsing failed');
            return el.clone(num);
        });
    }
}
