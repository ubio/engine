import assert from 'assert';
import * as sinon from 'sinon';

import { Target } from '../../../../main/index.js';
import { runtime } from '../../runtime.js';

describe('Page.setMouseMovements', () => {

    afterEach(() => sinon.restore());

    it('does not fail on a browser without Chromaton', async () => {
        await runtime.runActions([
            {
                type: 'Page.setMouseMovements',
                enabled: false,
            },
        ]);
    });

    it('turns Chromaton mouse movements off', async () => {
        const send = sinon.spy(Target.prototype, 'send');
        await runtime.runActions([
            {
                type: 'Page.setMouseMovements',
                enabled: false,
            },
        ]);
        const calls = getChromatonCalls(send);
        assert.deepStrictEqual(calls, [
            {
                settings: {
                    mouseMovements: false,
                },
            },
        ]);
    });

    it('resets Chromaton settings when the next session starts', async () => {
        await runtime.runActions([
            {
                type: 'Page.setMouseMovements',
                enabled: false,
            },
        ]);
        const send = sinon.spy(Target.prototype, 'send');
        await runtime.engine.startSession();
        await runtime.engine.startSession();
        const calls = getChromatonCalls(send);
        assert.deepStrictEqual(calls, [
            {
                reset: true,
            },
        ]);
    });

    it('sends nothing to Chromaton when no script changed it', async () => {
        const send = sinon.spy(Target.prototype, 'send');
        await runtime.engine.startSession();
        await runtime.openNewTab();
        const calls = getChromatonCalls(send);
        assert.deepStrictEqual(calls, []);
    });

});

function getChromatonCalls(send: sinon.SinonSpy) {
    const calls = send.getCalls().filter(call => call.args[0] === 'Browser.configureChromaton');
    return calls.map(call => call.args[1]);
}
