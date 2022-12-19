import jsonPointer from 'jsonpointer';

import { RuntimeCtx } from '../ctx.js';
import { Element } from '../element.js';
import { params } from '../model/index.js';
import { Pipe } from '../pipe.js';
import * as util from '../util/index.js';

export class ValueCompose extends Pipe {
    static $type = 'Object.compose';
    static override $help = `
Creates an object according to specified mappings.

Each mapping specifies a JSON pointer and an expression.
Expressions are evaluated according to rules specified in Expression pipe and are assigned to
corresponding JSON pointers.

### Use For

- shaping output objects with bulk move and assign operations
- building template objects for outputs and network requests, which can subsequently be modified or extended
`;

    @params.Recordset({
        singular: 'mapping',
        fields: [
            {
                name: 'path',
                type: 'string',
                source: 'dataPaths',
                value: '',
            },
            {
                name: 'value',
                type: 'string',
                source: 'dataPaths',
                value: '',
            },
        ],
    })
    mappings: ComposeRecord[] = [];

    @params.Enum({
        enum: ['replace', 'assign', 'defaults'],
        help: `
Specifies how to construct the resulting object:

- replace: the resulting object is returned, and the input object is discarded.
- assign: the resulting object is merged with input object
  overwriting existing keys (analogous to Assign with overwrite: true).
- defaults: the resulting object is merged with input object,
  existing keys are retained in input object (analogous to Assign with overwrite: false).
`,
    })
    mode: string = 'replace';

    async apply(inputSet: Element[], _ctx: RuntimeCtx): Promise<Element[]> {
        const mappings = this.mappings;
        const mode = this.mode;

        return this.map(inputSet, el => {
            const newData = mode === 'replace' ? {} : util.deepClone(el.value);
            util.checkType(newData, 'object');
            for (const mapping of mappings) {
                const { path, value } = mapping;
                if (mode === 'defaults' && jsonPointer.get(newData, path) != null) {
                    continue;
                }
                const val = util.evalExpression(value, el.value);
                if (val !== undefined) {
                    jsonPointer.set(newData, path, val);
                }
            }
            return el.clone(newData);
        });
    }
}

interface ComposeRecord {
    path: string;
    value: string;
}
