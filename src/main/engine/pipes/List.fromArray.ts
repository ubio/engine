import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class ListFromArray extends Pipe {
    static $type = 'List.fromArray';
    static override $help = `
Given an array as input value, creates an element for each value of this array.

For example, if input set contains 2 elements with arrays \`[1, 2, 3]\` and \`[4, 5]\` respectively,
then the output set will contain 5 elements with values \`1\`, \`2\`, \`3\`, \`4\`, \`5\` respectively.

An error is thrown if input value is not an array.

### Use For

- trasnforming arrays (e.g. from Job Input) into elements for subsequent manipulations with other pipes

### See Also

- List.toArray: for reverse functionality
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return this.map(inputSet, el => {
            util.checkType(el.value, 'array');
            return el.value.map((datum: any) => el.clone(datum));
        });
    }
}
