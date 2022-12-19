import { launcher, runtime } from './globals.js';
import { startServer } from './server.js';

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
