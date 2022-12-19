import { Action } from './action.js';
import { params } from './model/index.js';
import { Pipeline } from './pipeline.js';

export class DefinitionAction extends Action {
    static $type = 'definition';
    static $category = 'Basic';
    static $icon = 'fas fa-cubes';
    static $hidden = true;
    static override $help = `
Defines a pipeline which can subsequently be used in other actions via Use Definition pipe.

### Use For

- extracting common functionality (e.g. inbound and outbound flight selection would share common parts for extracting flight information, prices, etc.)
`;

    @params.Pipeline()
    pipeline!: Pipeline;

    async exec() {}
}
