import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Pipes: value/remove-diacritics', () => {
    it('replaces accented chars with latin analogues', async () => {
        const results = await runtime.runPipes([
            {
                type: 'Value.getJson',
                value: JSON.stringify(['Sœur', 'Façade', 'Mère', 'Île', 'Noël', 'Habañero']),
            },
            { type: 'List.fromArray' },
            {
                type: 'String.removeDiacritics',
            },
        ]);
        assert.equal(results.length, 6);
        const values = results.map(el => el.value);
        assert.deepEqual(values, ['Soeur', 'Facade', 'Mere', 'Ile', 'Noel', 'Habanero']);
    });
});
