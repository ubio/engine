import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class ValueParseBoolean extends Pipe {
    static $type = 'String.parseBoolean';
    static override $help = `
Parses a boolean value from input string.

An error is thrown if input value is not a string.

### Use For

- parsing booleans obtained from string representation (e.g. from web page attribute)
`;

    @params.Boolean()
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const optional = this.optional;

        return this.map(inputSet, el => {
            util.checkType(el.value, 'string');
            const bool = el.value === 'true' ? true : el.value === 'false' ? false : null;
            util.assertPlayback(bool != null || optional, 'Boolean parsing failed');
            return el.clone(bool);
        });
    }
}
