import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Browser.selectTargets', () => {
    it('select-target returns an element', async () => {
        await runtime.goto('/index.html');
        const result = await runtime.runPipes([
            {
                type: 'Browser.selectTargets',
                hostnameRegexp: '(?<!\\/).*',
                pathnameRegexp: '.*',
            },
        ]);
        assert(result.length > 0);
    });
});
