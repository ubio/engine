import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Value.getOutcome', () => {

    context('action exists', () => {

        context('action was run', () => {
            it('returns an outcome', async () => {
                const { outputAction, resultAction } = createTestRig();
                await outputAction.run();
                const res = await resultAction.selectOne((resultAction as any).pipeline);
                assert.equal(res.value, 'I am the outcome');
            });
        });

        context('action was not run', () => {
            it('throws an error if non optional', async () => {
                const { resultAction } = createTestRig();
                try {
                    await resultAction.selectOne((resultAction as any).pipeline);
                    throw new Error('Unexpected success');
                } catch (err: any) {
                    assert.equal(err.name, 'OutcomeNotAvailable');
                }
            });

            it('resolves null if optional', async () => {
                const { resultAction } = createTestRig({ optional: true });
                const res = await resultAction.selectOne((resultAction as any).pipeline);
                assert.equal(res.value, null);
            });
        });

    });

    context('action does not exist', () => {

        it('throws an error', async () => {
            const { resultAction } = createTestRig({
                ref: {
                    actionId: 'unknown',
                    paramName: '$foo'
                }
            });
            try {
                await resultAction.selectOne((resultAction as any).pipeline);
                throw new Error('Unexpected success');
            } catch (err: any) {
                assert.equal(err.name, 'InvalidScript');
            }
        });

    });

});

function createTestRig(overrides: any = {}) {
    const script = runtime.createScriptWithActions([
        {
            id: 'output',
            type: 'Flow.output',
            outputKey: 'foo',
            pipeline: [
                {
                    type: 'Value.getJson',
                    value: JSON.stringify('I am the outcome'),
                },
            ]
        },
        {
            id: 'result',
            type: 'placeholder',
            pipeline: [
                {
                    type: 'Value.getOutcome',
                    ref: {
                        actionId: 'output',
                        paramName: '$output',
                    },
                    ...overrides
                }
            ]
        }
    ]);
    const outputAction = script.getActionById('output')!;
    const resultAction = script.getActionById('result')!;
    return {
        script,
        outputAction,
        resultAction,
    };
}
