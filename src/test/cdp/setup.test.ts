import { startServer } from '../server.js';
import { launcher, runtime } from './globals.js';

before(async () => {
    await startServer();
    await launcher.launch();
    await runtime.browser.connect();
});

after(async () => {
    await runtime.browser.close();
});

beforeEach(async () => {
    await runtime.openNewTab();
});

afterEach(async () => {
    await runtime.closeTab();
});
