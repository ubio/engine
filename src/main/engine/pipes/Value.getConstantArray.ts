import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params, Pipe } from '../model/index.js';
import * as util from '../util/index.js';

interface Value {
    dataType: 'string' | 'number' | 'boolean';
    value: string;
}

export class ValueGetConstantArray extends Pipe {
    static $type = 'Value.getConstantArray';
    static override $help = `
Returns an array of specified constant values.

### Use For

- quickly creating arrays of primitive values (numbers, strings, etc)
`;

    @params.Recordset({
        singular: 'value',
        fields: [
            {
                name: 'dataType',
                type: 'enum',
                value: 'string',
                enum: ['string', 'number', 'boolean'],
            },
            {
                name: 'value',
                type: 'string',
                value: '',
            },
        ],
    })
    values: Value[] = [];

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const values = this.values;
        const array = values.map(v => util.getConstant(v.dataType, v.value));
        return this.map(inputSet, el => {
            return array.map(v => el.clone(v));
        });
    }
}
