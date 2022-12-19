import Json5 from 'json5';

import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';

export class ValueGetJson extends Pipe {
    static $type = 'Value.getJson';
    static override $help = `
Returns the specified JSON object.

### Use For

- testing (quickly providing pipelines with any data)
- building templates for Job Outputs and Network Requests,
  which can subsequently be modified or extended
`;

    @params.Json()
    value: string = '';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const json = Json5.parse(this.value);
        return this.map(inputSet, el => {
            return el.clone(json);
        });
    }
}
