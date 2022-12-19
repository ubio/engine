import assert from 'assert';
import path from 'path';

import { ChromeLauncher } from '../../main/index.js';
import { TestRuntime } from './runtime.js';

const chromePort = Number(process.env.CHROME_PORT) || 9123;
const chromeAddress = process.env.CHROME_ADDRESS || '127.0.0.1';
const chromePath = process.env.CHROME_PATH || undefined;
const chromeArgs = process.env.CHROME_ARGS || '';

export { assert };

export const runtime = new TestRuntime();

export const launcher = new ChromeLauncher({
    chromePort,
    chromePath,
    chromeAddress,
    userDataDir: path.resolve(process.cwd(), '.tmp/chromedata'),
    args: chromeArgs.split(/\s+/).filter(Boolean),
});

export async function assertError(code: string, asyncFn: () => any): Promise<Error> {
    try {
        await asyncFn();
        throw new UnexpectedSuccessError();
    } catch (err: any) {
        assert.equal(err.code, code);
        return err;
    }
}

class UnexpectedSuccessError extends Error {
    code: string = 'UnexpectedSuccess';
}
