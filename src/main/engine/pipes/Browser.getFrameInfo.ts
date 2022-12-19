import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { Pipe } from '../pipe.js';

export class DomFrameInfo extends Pipe {
    static $type = 'Browser.getFrameInfo';
    static override $help = `
Returns information about current frame and its loading state.

### Use For

- implementing assertions on frame loading, readiness or failure to load
`;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        return await this.map(inputSet, async el => {
            const frame = el.remote.page.mainFrame();
            return el.clone({
                frameId: frame.frameId,
                url: frame.url,
                loaded: frame.loaded,
                ready: frame.ready,
                failed: frame.failed,
            });
        });
    }
}
