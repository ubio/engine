import assert from 'assert';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { CapsolverChromeExtension, loadConfigFromJs } from '../../../main/cdp/capsolver-chrome-extension';


describe('CapsolverChromeExtension', () => {
    let capsolver: CapsolverChromeExtension;
    const originalConfigPath = path.join(__dirname, '..', '..', '..', '..', 'chrome-extensions', 'CapSolver', 'assets', 'config.js');
    const extensionPath = path.join(tmpdir(), 'my-extension-folder');
    const assetsPath = path.join(extensionPath, 'assets');
    const configPath = path.join(assetsPath, 'config.js');
    const apiKey = 'test-api-key';

    before(async () => {
        await fs.mkdir(assetsPath, { recursive: true });
    });

    after(async () => {
        await fs.rm(assetsPath, { recursive: true, force: true });
    });

    beforeEach(async () => {
        capsolver = new CapsolverChromeExtension(extensionPath, apiKey);

        const defaultConfig = await fs.readFile(originalConfigPath, { encoding: 'utf8' });
        await fs.writeFile(configPath, defaultConfig, { encoding: 'utf8' });
    });

    afterEach(async () => {
        await fs.unlink(configPath);
    });

    describe('addApiKey', () => {
        it('should add the API key to the config file', async () => {
            await capsolver.addApiKey();

            const config = await loadConfigFromJs(configPath);

            assert.equal(config.apiKey, apiKey);
        });

        it('should simulate 16 m1 workers concurrently adding API key to the same config', async () => {

            const promises: Promise<void>[] = [];
            for (let i = 0; i < 16; ++i) {
                promises.push(capsolver.addApiKey());
            }

            await Promise.all(promises);

            const config = await loadConfigFromJs(configPath);

            assert.equal(config.apiKey, apiKey);
        });
    });

    describe('removeApiKey', () => {
        it('should remove the API key from the config file', async () => {
            await capsolver.addApiKey();

            await capsolver.removeApiKey();

            const config = await loadConfigFromJs(configPath);

            assert.equal(config.apiKey, '');
        });
    });
});
