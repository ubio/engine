import { Action } from '../model/index.js';

export class GroupAction extends Action {
    static $type = 'Flow.group';
    static $icon = 'fas fa-folder';
    static override $help = `
Groups a set of actions.

### Use For

- structuring and organizing scripts
`;

    override hasChildren() {
        return true;
    }

    async exec() {}

    override afterRun() {
        this.enter();
    }
}
