import { Action } from '../model/index.js';
import { CheckpointService } from '../services/index.js';

export class CheckpointAction extends Action {
    static $type = 'Flow.checkpoint';
    static $icon = 'fas fa-map-marker';
    static override $help = '';

    get $checkpoints() {
        return this.$engine.get(CheckpointService);
    }

    async exec() {
        const data = await this.$checkpoints.createCheckpoint(this.label);
        await this.$checkpoints.sendCheckpoint(data);
    }
}
