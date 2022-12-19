import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';

export class DataLocalRestore extends Pipe {
    static $type = 'Data.restoreLocal';
    static override $help = `
Restores a set saved with Local Save pipe.
Input set is discared.
`;

    @params.String({ source: 'locals', showInHeader: true })
    key: string = '';

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        return ctx.getLocal(this.key);
    }
}
