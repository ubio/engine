import { injectable } from 'inversify';

import { CheckpointData, CheckpointService } from '../../../main/index.js';

@injectable()
export class CheckpointServiceMock extends CheckpointService {
    checkpoint: CheckpointData | null = null;

    override async sendCheckpoint(checkpointData: CheckpointData) {
        this.checkpoint = checkpointData;
    }
}
