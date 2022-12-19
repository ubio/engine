import { runtime } from '../../runtime.js';

describe('Pipes: other/assert-exists', () => {
    it('throws a custom error code', async () => {
        await runtime.assertError('CustomError', async () => {
            await runtime.runPipes([
                { type: 'Value.getJson', value: '[]' },
                { type: 'List.fromArray' },
                {
                    type: 'Assert.exists',
                    errorCode: 'CustomError',
                },
            ]);
        });
    });
});
