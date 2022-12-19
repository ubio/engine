import { RemoteElementInfo } from '../../cdp/index.js';
import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../model/index.js';

export abstract class DomExtractPipe extends Pipe {
    abstract getDatum(info: RemoteElementInfo): any;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return await this.map(inputSet, async el => {
            const info = await el.getInfo();
            const datum = this.getDatum(info);
            return el.clone(datum);
        });
    }
}
