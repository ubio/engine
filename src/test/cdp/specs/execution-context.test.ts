import { RemoteElement, RemoteObject } from '../../../main/index.js';
import { assert, assertError, runtime } from '../globals.js';

describe('ExecutionContext', () => {
    describe('evaluate', () => {
        it('evaluates document as RemoteElement', async () => {
            await runtime.goto('/index.html');
            const ex = await runtime.page.mainFrame().getCurrentExecutionContext();
            const res = await ex.evaluate(() => document);
            assert(res instanceof RemoteElement);
        });

        it('evaluates async functions', async () => {
            const ex = await runtime.page.mainFrame().getCurrentExecutionContext();
            const res = await ex.evaluate(async () => {
                await new Promise(r => setTimeout(r, 100));
            });
            assert(res instanceof RemoteObject);
        });

        it('provides on-page exceptions', async () => {
            const ex = await runtime.page.mainFrame().getCurrentExecutionContext();
            const err = await assertError('EvaluateFailed', async () => {
                await ex.evaluate(() => {
                    throw new Error('Some error message');
                });
            });
            assert(err.message.includes('Some error message'));
        });
    });
});
