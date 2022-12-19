import { Element } from '../element.js';
import { Pipe } from '../pipe.js';

export class NumberSum extends Pipe {
    static $type = 'Number.sum';
    static override $help = `
Returns a single element whose value is a numeric sum of all input set values.
`;

    async apply(inputSet: Element[]): Promise<Element[]> {
        const sum = inputSet.reduce((sum, el) => {
            const num = parseFloat(el.value) || 0;
            return num + sum;
        }, 0);
        const el = await this.createDocument(sum);
        return [el];
    }
}
