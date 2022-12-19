import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class ValueMatchesRegexp extends Pipe {
    static $type = 'String.matchesRegexp';
    static override $help = `
Returns \`true\` if input string matches specified regular expression, and \`false\` otherwise.
An error is thrown iff input value is not a string.

See [String#match](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match)
for more information about regular expressions matching.

### Parameters

- regexp: regular expression
- flags

### Use For

- general purpose string matching (e.g. as part of matchers or conditions)

### See Also

- Replace Regexp: for replacing string with regular expressions
- Extract Regexp: for retrieving capturing groups
`;

    @params.String()
    regexp: string = '';
    @params.Boolean()
    caseInsensitive: boolean = true;

    override init(spec: any) {
        super.init(spec);
        // Migration
        if (spec.flags) {
            this.caseInsensitive = spec.flags.includes('i');
        }
    }

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const regexp = this.regexp;
        const caseInsensitive = this.caseInsensitive;

        const flags = caseInsensitive ? 'gi' : 'g';
        const r = new RegExp(regexp, flags);
        return this.map(inputSet, el => {
            util.checkType(el.value, 'string');
            return el.clone(r.test(el.value));
        });
    }
}
