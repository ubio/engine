import { Action } from '../model/index.js';

export class LeaveContextAction extends Action {
    static $type = 'Flow.leaveContext';
    static $icon = 'fas fa-sign-out-alt';
    static override $help = `
Leaves current context. The subsequent execution step will be context matching.

### Use For

- advanced scripting, where fine grained flow control is required
`;

    async exec() {}

    override afterRun() {
        this.$context.leave();
    }
}
