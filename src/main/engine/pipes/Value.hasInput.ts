import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';

export class ValueHasInput extends Pipe {
    static $type = 'Value.hasInput';
    static override $help = `
Returns \`true\` if an Input with specified name exists, without requesting it.
`;

    @params.String({
        source: 'inputs',
        showInHeader: true,
    })
    inputKey: string = '';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const inputKey = this.inputKey;
        const data = await this.$script.peekInput(inputKey);
        return this.map(inputSet, el => {
            return el.clone(data !== undefined);
        });
    }
}
