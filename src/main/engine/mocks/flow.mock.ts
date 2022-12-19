import assert from 'assert';
import { injectable } from 'inversify';

import { ScriptInput, ScriptOutput } from '../model/index.js';
import { FlowService } from '../services/index.js';

@injectable()
export class FlowServiceMock extends FlowService {
    inputs: ScriptInput[] = [];
    outputs: ScriptOutput[] = [];

    async requestInputData(key: string) {
        const input = this.inputs.find(_ => _.key === key);
        assert(input, `Input ${key} not found`);
        return input!.data;
    }

    async peekInputData(key: string) {
        const input = this.inputs.find(_ => _.key === key);
        return input ? input.data : undefined;
    }

    async resetInputData(key: string) {
        this.inputs = this.inputs.filter(_ => _.key !== key);
    }

    async sendOutputData(key: string, data: any) {
        this.outputs.push({ key, data });
    }

    async sendScreenshot() { }
    async sendHtmlSnapshot() { }
    async sendEvent() { }
}
