import { Action, params, Pipeline } from '../model/index.js';
import * as util from '../util/index.js';
import { collectIfElseChain } from './Flow.if';

export class ElseIfAction extends Action {
    static $type = 'Flow.elseIf';
    static $icon = 'fas fa-question';
    static override $help = `
Same as If, but does not evaluate the pipeline if any preceeding If or Else If action was entered.

This action must be placed next to either If or another Else If action.
All adjacent If, Else If and Else actions form a single chain with a guarantee that at most one branch is entered.

### Use For

- general purpose branching and conditional execution
`;

    @params.Pipeline()
    pipeline!: Pipeline;

    override hasChildren() {
        return true;
    }

    async exec() {
        const chain = this.getChain();
        util.assertScript(chain.length, 'else-if must immediately follow if or another else-if');
        for (const action of chain) {
            util.assertPlayback(
                action.$runtime.bypassed != null,
                'Cannot execute else-if: previous actions need to be executed first',
            );
            if (!action.$runtime.bypassed) {
                this.$runtime.bypassed = true;
                return;
            }
        }
        await this.retry(async () => {
            const el = await this.selectSingle(this.pipeline, false);
            const condition = el!.value;
            util.checkType(condition, 'boolean');
            this.$runtime.bypassed = !condition;
        });
    }

    override afterRun() {
        if (this.$runtime.bypassed) {
            this.skip();
        } else {
            this.enter();
        }
    }

    getChain(): Action[] {
        return Array.from(collectIfElseChain(this));
    }
}
