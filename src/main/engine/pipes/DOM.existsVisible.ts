import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe, Pipeline } from '../model/index.js';

export class QueryExistsVisible extends Pipe {
    static $type = 'DOM.existsVisible';
    static override $help = ``;

    @params.Selector()
    selector: string = '';

    async apply(inputSet: Element[], ctx: RuntimeCtx): Promise<Element[]> {
        const pipeline = new Pipeline(this, '', [
            {
                selector: this.selector,
                optional: true,
                type: 'DOM.queryAll'
            },
            {
                type: 'List.filter',
                pipeline: [
                    { type: 'DOM.isVisible' }
                ],
            },
            {
                type: 'List.exists'
            }
        ]);
        return await pipeline.selectAll(inputSet, ctx);
    }
}
