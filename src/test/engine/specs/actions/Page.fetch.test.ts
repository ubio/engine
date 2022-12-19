import assert from 'assert';

import { runtime } from '../../runtime.js';

describe('Page.fetch', () => {
    context('Chrome page runtime (Fetch)', () => {
        it('sends POST with json payload', async () => {
            await runtime.goto('/index.html');
            await runtime.runActions([
                {
                    type: 'Page.fetch',
                    mode: 'Fetch',
                    requestBodyFormat: 'json',
                    responseBodyFormat: 'json',
                    pipeline: {
                        pipes: [
                            {
                                type: 'Value.getJson',
                                value: JSON.stringify({
                                    url: runtime.getUrl('/echo'),
                                    method: 'POST',
                                    body: { hello: 'world' },
                                }),
                            },
                        ],
                    },
                    children: [
                        {
                            type: 'Flow.output',
                            outputKey: 'result',
                        },
                    ],
                },
            ]);
            const output = runtime.flow.outputs.find(o => o.key === 'result')!;
            assert.ok(output);
            assert.equal(output.data.request.method, 'POST');
            assert.equal(output.data.request.url, runtime.getUrl('/echo'));
            assert.ok(output.data.request.headers);
            assert.ok(output.data.request.body);
            assert.equal(output.data.response.status, 200);
            assert.equal(output.data.response.statusText, 'OK');
            assert.ok(output.data.response.headers);
            assert.deepEqual(output.data.response.body, { hello: 'world' });
        });

        it('does not reject http errors when rejectHttpErrors: false', async () => {
            await runtime.goto('/index.html');
            await runtime.runActions([
                {
                    type: 'Page.fetch',
                    mode: 'Fetch',
                    requestBodyFormat: 'none',
                    responseBodyFormat: 'none',
                    rejectHttpErrors: false,
                    pipeline: {
                        pipes: [
                            {
                                type: 'Value.getJson',
                                value: JSON.stringify({
                                    url: runtime.getUrl('/error/403'),
                                    method: 'get',
                                }),
                            },
                        ],
                    },
                    children: [
                        {
                            type: 'Flow.output',
                            outputKey: 'result',
                        },
                    ],
                },
            ]);
            const output = runtime.flow.outputs.find(o => o.key === 'result')!;
            assert.ok(output);
            assert.equal(output.data.request.method, 'GET');
            assert.equal(output.data.request.url, runtime.getUrl('/error/403'));
            assert.equal(output.data.response.status, 403);
        });
    });

    context('Node.js runtime', () => {
        it('sends POST with json payload', async () => {
            await runtime.goto('/index.html');
            await runtime.runActions([
                {
                    type: 'Page.fetch',
                    mode: 'Node',
                    requestBodyFormat: 'json',
                    responseBodyFormat: 'json',
                    pipeline: {
                        pipes: [
                            {
                                type: 'Value.getJson',
                                value: JSON.stringify({
                                    url: runtime.getUrl('/echo'),
                                    method: 'POST',
                                    body: { hello: 'world' },
                                }),
                            },
                        ],
                    },
                    children: [
                        {
                            type: 'Flow.output',
                            outputKey: 'result',
                        },
                    ],
                },
            ]);
            const output = runtime.flow.outputs.find(o => o.key === 'result')!;
            assert.ok(output);
            assert.equal(output.data.request.method, 'POST');
            assert.equal(output.data.request.url, runtime.getUrl('/echo'));
            assert.ok(output.data.request.headers);
            assert.ok(output.data.request.body);
            assert.equal(output.data.response.status, 200);
            assert.equal(output.data.response.statusText, 'OK');
            assert.ok(output.data.response.headers);
            assert.deepEqual(output.data.response.body, { hello: 'world' });
        });
    });
});
