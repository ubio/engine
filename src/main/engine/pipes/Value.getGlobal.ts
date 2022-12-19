import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';

export class ValueGetGlobal extends Pipe {
    static $type = 'Value.getGlobal';
    static override $help = `
Returns the value of specific Global variable (set by Set Global action).
An error is thrown if Global variable is not set.
`;

    @params.String({
        source: 'globals',
        help: 'Key of the Global variable (as specified by Set Global action).',
        showInHeader: true,
    })
    key: string = '';

    @params.Boolean({
        help: `Return \`null\` instead of throwing an error when specified Global variable is not set.`,
    })
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const key = this.key;
        const optional = this.optional;

        const data = this.$script.getGlobal(key, optional);
        return this.map(inputSet, el => {
            return el.clone(data);
        });
    }
}
