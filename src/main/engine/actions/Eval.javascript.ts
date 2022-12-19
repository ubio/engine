import { Action } from '../action.js';
import { params } from '../model/index.js';
import { Pipeline } from '../pipeline.js';
import * as util from '../util/index.js';

export class JavascriptAction extends Action {
    static $type = 'Eval.javascript';
    static $icon = 'fas fa-code';
    static override $help = `
Executes arbitrary JavaScript code.

Following top-level variables are available:

- \`els\` — output set of pipeline
- \`el\` — first element of \`els\` (for convenience, when dealing with single-element pipes)
- \`ctx\` — a context object
`;

    @params.Pipeline()
    pipeline!: Pipeline;

    @params.JavaScript()
    expression: string = '// Enter your code here\nreturn el.value;';

    @params.Outcome()
    $outcome: any = undefined;

    @params.Number({
        min: 1000,
    })
    timeout: number = 60000;

    override reset() {
        super.reset();
        this.$outcome = undefined;
    }

    async exec() {
        const els = await this.selectAll(this.pipeline);
        const ctx = this.createCtx();
        const js = util.compileAsyncJs(this.expression, 'ctx', 'els', 'el');
        this.$outcome = await js(ctx, els, els[0]);
    }
}
