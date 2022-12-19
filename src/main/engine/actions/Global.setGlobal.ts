import { Action } from '../action.js';
import { params } from '../model/index.js';
import { Pipeline } from '../pipeline.js';
import * as util from '../util/index.js';

export class SetGlobalAction extends Action {
    static $type = 'Global.setGlobal';
    static $icon = 'fas fa-globe';
    static override $help = `
Sets a global variable, which can be subsequently obtained using Get Global pipe.

The pipeline should return a single element. Its value will be associated with specified key.
`;

    @params.String({ source: 'globals' })
    key: string = '';

    @params.Pipeline()
    pipeline!: Pipeline;

    @params.Boolean()
    optional: boolean = false;

    override getLabel() {
        return this.key;
    }

    async exec() {
        util.assertScript(this.key, 'key is required');
        await this.retry(async () => {
            const el = await this.selectSingle(this.pipeline, this.optional);
            if (el) {
                this.$script.setGlobal(this.key, el.value);
            }
        });
    }
}
