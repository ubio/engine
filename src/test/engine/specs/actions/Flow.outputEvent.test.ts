import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Flow.outputEvent', () => {
    it('sends output event with type and details', async () => {
        await runtime.runActions([
            {
                id: 'outputEvent',
                type: 'Flow.outputEvent',
                eventType: 'foo',
                pipeline: {
                    pipes: [
                        {
                            type: 'Value.getJson',
                            value: JSON.stringify({
                                foo: 'bar',
                                details: 123,
                            }),
                        },
                    ],
                },
            },
        ]);
        const output = runtime.flow.outputs.find(o => o.key.startsWith('events'))!;
        assert.ok(output);
        assert.ok(output.key.startsWith('events:'));
        assert.deepEqual(output.data.type, 'foo');
        assert.deepEqual(output.data, {
            type: 'foo',
            foo: 'bar',
            details: 123,
        });
    });

    it('sends output event with evaluated type', async () => {
        await runtime.runActions([
            {
                id: 'output',
                type: 'Flow.outputEvent',
                eventType: 'foo',
                pipeline: {
                    pipes: [
                        {
                            type: 'Value.getJson',
                            value: JSON.stringify({
                                type: 'bar',
                                foo: 'bar',
                                details: 123,
                            }),
                        },
                    ],
                },
            },
        ]);
        const output = runtime.flow.outputs.find(o => o.key.startsWith('events'))!;
        assert.ok(output);
        assert.ok(output.key.startsWith('events:'));
        assert.deepEqual(output.data.type, 'bar');
        assert.deepEqual(output.data, {
            type: 'bar',
            foo: 'bar',
            details: 123,
        });
    });
});
