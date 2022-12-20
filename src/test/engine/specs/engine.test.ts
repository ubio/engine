import assert from 'assert';

import { Engine } from '../../../main/index.js';
import { runtime } from '../runtime.js';

describe('Engine', () => {

    describe('getAllBindings', () => {

        it('returns a list of bound classes', () => {
            const bindings = runtime.engine.getAllBindings();
            assert.ok(bindings.length > 0);
            assert.ok(bindings.some(_ => _.serviceIdentifier === Engine));
        });

    });

});
