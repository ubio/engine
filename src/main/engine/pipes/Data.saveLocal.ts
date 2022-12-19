import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';

export class DataLocalSave extends Pipe {
    static $type = 'Data.saveLocal';
    static override $help = `
Saves input set, so that it could be later restored with Local Restore.
`;

    @params.String({ source: 'locals', showInHeader: true })
    key: string = '';

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        ctx.setLocal(this.key, inputSet);
        return inputSet;
    }
}
