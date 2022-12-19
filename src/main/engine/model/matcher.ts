import { Exception } from '../../exception.js';
import * as util from '../util/index.js';
import { Action } from './action.js';
import * as params from './params.js';
import { Pipeline } from './pipeline.js';

export class MatcherAction extends Action {
    static $type = 'matcher';
    static $icon = 'fas fa-check';
    static $hidden = true;

    @params.Pipeline()
    pipeline!: Pipeline;

    async performMatch(): Promise<void> {
        await this._trackRuntimeStats(() => this.performCheck());
    }

    async exec() {
        await this.performCheck();
    }

    async performCheck() {
        const el = await this.selectSingle(this.pipeline, false);
        util.checkType(el!.value, 'boolean');
        if (!el!.value) {
            throw new Exception({
                name: 'MatchFailed',
                message: 'Matcher failed to match',
                retry: false,
            });
        }
    }
}
