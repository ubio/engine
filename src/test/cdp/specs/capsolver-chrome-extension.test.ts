import assert from 'assert';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { CapsolverChromeExtension } from '../../../main/cdp/capsolver-chrome-extension';


describe('CapsolverChromeExtension', () => {
    let capsolver: CapsolverChromeExtension;
    const extensionPath = path.join(tmpdir(), 'my-extension-folder');
    const assetsPath = path.join(extensionPath, 'assets');
    const configPath = path.join(assetsPath, 'config.json');
    const apiKey = 'test-api-key';

    before(async () => {
        await fs.mkdir(assetsPath, { recursive: true });
    });

    after(async () => {
        await fs.rm(assetsPath, { recursive: true, force: true });
    });

    beforeEach(async () => {
        capsolver = new CapsolverChromeExtension(extensionPath, apiKey);

        const defaultConfig = {
            apiKey: '',
            appId: '',
            useCapsolver: true,
            manualSolving: false,
            solvedCallback: 'captchaSolvedCallback',
            useProxy: false,
            proxyType: 'http',
            hostOrIp: '',
            port: '',
            proxyLogin: '',
            proxyPassword: '',

            enabledForBlacklistControl: false,
            blackUrlList: [],

            enabledForRecaptcha: true,
            enabledForRecaptchaV3: true,
            enabledForHCaptcha: true,
            enabledForFunCaptcha: true,
            enabledForImageToText: true,

            reCaptchaMode: 'click',
            hCaptchaMode: 'click',

            reCaptchaDelayTime: 0,
            hCaptchaDelayTime: 0,
            textCaptchaDelayTime: 0,

            reCaptchaRepeatTimes: 10,
            reCaptcha3RepeatTimes: 10,
            hCaptchaRepeatTimes: 10,
            funCaptchaRepeatTimes: 10,
            textCaptchaRepeatTimes: 10,

            textCaptchaSourceAttribute: 'capsolver-image-to-text-source',
            textCaptchaResultAttribute: 'capsolver-image-to-text-result'

        };
        await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), { encoding: 'utf8' });
    });

    afterEach(async () => {
        await fs.unlink(configPath);
    });

    describe('addApiKey', () => {
        it('should add the API key to the config file', async () => {
            await capsolver.addApiKey();

            const rawData = await fs.readFile(configPath, { encoding: 'utf8' });
            const jsonData = JSON.parse(rawData);

            assert.equal(jsonData.apiKey, apiKey);
        });

        it('should simulate 16 m1 workers concurrently adding API key to the same config', async () => {

            const promises: Promise<void>[] = [];
            for (let i = 0; i < 16; ++i) {
                promises.push(capsolver.addApiKey());
            }

            await Promise.all(promises);

            const rawData = await fs.readFile(configPath, { encoding: 'utf8' });
            const jsonData = JSON.parse(rawData);

            assert.equal(jsonData.apiKey, apiKey);
        });
    });

    describe('removeApiKey', () => {
        it('should remove the API key from the config file', async () => {
            await capsolver.addApiKey();

            await capsolver.removeApiKey();

            const rawData = await fs.readFile(configPath, { encoding: 'utf8' });
            const jsonData = JSON.parse(rawData);

            assert.equal(jsonData.apiKey, '');
        });
    });
});
