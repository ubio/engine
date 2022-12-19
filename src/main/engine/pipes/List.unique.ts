import jsonStableStringify from 'fast-json-stable-stringify';

import { Pipe } from '..';
import { Element } from '../element.js';

export class ListUnique extends Pipe {
    static $type = 'List.unique';

    async apply(inputList: Element[]) {
        const set: Set<string> = new Set();
        return await this.map(inputList, async el => {
            const val = el.objectId + '|' + jsonStableStringify(el.value ?? null);
            if (set.has(val)) {
                return null;
            }
            set.add(val);
            return el;
        });
    }

}
