import { Action } from '../action.js';
import { params } from '../model/index.js';
import { Pipeline } from '../pipeline.js';
import * as util from '../util/index.js';

export class PlaceholderAction extends Action {
    static $type = 'placeholder';
    static $icon = 'far fa-circle';
    static $hidden = true;
    static override $help = `
Use this action to get quick access to pipeline configuration and deciding what to do with its results later.

After pipeline is congifured, use Change Type to convert the placeholder into one of the actions.

Running the placeholder will result in an error.
`;

    @params.Pipeline()
    pipeline!: Pipeline;

    async exec() {
        throw util.scriptError('Cannot run a placeholder. Please convert it into a specific action.');
    }
}
