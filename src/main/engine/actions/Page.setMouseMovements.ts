import { Action, params } from '../model/index.js';
import { ChromatonService } from '../services/chromaton.js';

export class SetMouseMovementsAction extends Action {
    static $type = 'Page.setMouseMovements';
    static $icon = 'fas fa-mouse';
    static override $help = `
Turns Chromaton's human-like mouse movements on or off.

With mouse movements on, the pointer travels to an element before each click.
If the page moves during that trip, the click can land next to the element.
Turning them off makes clicks instant.

The setting applies to all tabs until the end of the job.
The next job starts with Chromaton's defaults again.

Only Chromaton workers support it. On other workers the action does nothing.

### Parameters

- enabled: if checked, mouse movements are turned on, otherwise off

### Use For

- fixing clicks that land above or below an element on pages that shift
`;

    @params.Boolean()
    enabled: boolean = false;

    get $chromaton() {
        return this.$container.get(ChromatonService);
    }

    async exec() {
        await this.$chromaton.setMouseMovements(this.enabled);
    }
}
