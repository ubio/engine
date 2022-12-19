import { ActionParamReference } from '../action.js';
import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class ValueGetOutcome extends Pipe {
    static $type = 'Value.getOutcome';
    static override $help = `
Returns an outcome of another action.
`;

    @params.ParamRef({
        label: 'Reference'
    })
    ref: ActionParamReference = { actionId: '', paramName: '' };

    @params.Boolean()
    optional: boolean = false;

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const value = this.getValue();
        return this.map(inputSet, el => {
            return el.clone(value);
        });
    }

    getValue() {
        const ref = this.ref;
        const action = this.$script.getActionById(ref.actionId);
        if (!action) {
            throw util.scriptError('Referenced action not found', { ref });
        }
        const param = action.getParams().filter(_ => _.type === 'outcome').find(_ => _.name === ref.paramName);
        if (!param) {
            throw util.scriptError('Action parameter not found', { ref });
        }
        const value = action.getParamValue(param.name);
        if (value === undefined && !this.optional) {
            throw util.createError({
                code: 'OutcomeNotAvailable',
                message: 'Outcome not available (make sure referenced action ran successfully)',
                retry: false,
                details: { ref, value }
            });
        }
        return value ?? null;
    }
}
