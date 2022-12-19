import { Action } from '../action.js';
import { params } from '../model/index.js';
import { Pipeline } from '../pipeline.js';

export class SwitchTargetAction extends Action {
    static $type = 'Page.switchTarget';
    static $icon = 'fas fa-window-restore';
    static override $help = '';

    @params.Pipeline()
    pipeline!: Pipeline;
    @params.Boolean()
    closeOtherTabs: boolean = false;

    async exec() {
        await this.retry(async () => {
            const el = await this.selectOne(this.pipeline);
            const { targetId } = el.page.target;
            await this.$browser.attach(targetId);
            await this.$page.activate();
            if (this.closeOtherTabs) {
                await this.$browser.closeOtherTabs();
            }
        });
    }
}
