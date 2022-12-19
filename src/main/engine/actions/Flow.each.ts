import { Element } from '../element.js';
import { Action, params, Pipeline } from '../model/index.js';
import * as util from '../util/index.js';

export class EachAction extends Action {
    static $type = 'Flow.each';
    static $icon = 'fas fa-list';
    static override $help = `
Iterates over a set of elements, passing control to children and modifying their scope.

The pipeline should resolve to a list of elements.
On every run the internal index is incremented, and the element at current index becomes the scope of children.

After last child is executed, the control is passed back to Each.
Each exits when there are no more elements left to iterate over.

Note: every time the children are executed the scope is re-evaluated;
specifically, if scope element disappears (or some other pipeline failure occurs),
then children won't be able to execute.

### Use For

- iterating over web page elements (e.g. passenger forms)
- executing actions per each item of the array
`;

    @params.Pipeline()
    pipeline!: Pipeline;

    $iteration: number | null = null;

    override reset() {
        super.reset();
        this.$iteration = null;
    }

    override hasChildren() {
        return true;
    }

    override async resolveChildrenScope() {
        const el = await this.getCurrentElement();
        util.assertPlayback(el, 'No iteration scope');
        return [el!];
    }

    async exec() {
        this.nextIndex();
        const el = await this.getCurrentElement();
        this.$runtime.bypassed = !el;
    }

    override afterRun() {
        if (this.$runtime.bypassed) {
            this.skip();
        } else {
            this.enter();
        }
    }

    override leave() {
        this.$script.setPlayhead(this);
    }

    async getCurrentElement(): Promise<Element | null> {
        const elements = await this.retry(() => this.selectAll(this.pipeline));
        return this.$iteration == null ? null : elements[this.$iteration];
    }

    nextIndex() {
        this.$iteration = this.$iteration == null ? 0 : this.$iteration + 1;
    }
}
