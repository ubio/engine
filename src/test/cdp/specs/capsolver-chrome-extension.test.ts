import assert from 'assert';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { CapsolverChromeExtension } from '../../../main/cdp/capsolver-chrome-extension';


describe('CapsolverChromeExtension', () => {
    let capsolver: CapsolverChromeExtension;
    const extensionPath = path.join(tmpdir(), 'my-extension-folder');
    const assetsPath = path.join(extensionPath, 'assets');
    const configPath = path.join(assetsPath, 'config.mjs');
    const apiKey = 'test-api-key';

    before(async () => {
        await fs.mkdir(assetsPath, { recursive: true });
    });

    after(async () => {
        await fs.rm(assetsPath, { recursive: true, force: true });
    });

    beforeEach(async () => {
        capsolver = new CapsolverChromeExtension(extensionPath, apiKey);

        const defaultConfig = `
        export const defaultConfig = {
            // API key
            apiKey: '',

            // Your Developer appId, Apply in dashboard's developer section
            appId: '',

            // Is the extension enabled by default or not
            useCapsolver: true,

            // Solve captcha manually
            manualSolving: false,

            // Captcha solved callback function name
            solvedCallback: 'captchaSolvedCallback',

            // Use proxy or not
            // If useProxy is true, then proxyType, hostOrIp, port, proxyLogin, proxyPassword are required
            useProxy: false,
            proxyType: 'http',
            hostOrIp: '',
            port: '',
            proxyLogin: '',
            proxyPassword: '',

            enabledForBlacklistControl: false, // Use blacklist control
            blackUrlList: [], // Blacklist URL list

            // Is captcha enabled by default or not
            enabledForRecaptcha: true,
            enabledForRecaptchaV3: true,
            enabledForHCaptcha: true,
            enabledForFunCaptcha: true,
            enabledForImageToText: true,
            enabledForAwsCaptcha: true,

            // Task type: click or token
            reCaptchaMode: 'click',
            hCaptchaMode: 'token',

            // Delay before solving captcha
            reCaptchaDelayTime: 0,
            hCaptchaDelayTime: 0,
            textCaptchaDelayTime: 0,
            awsDelayTime: 0,

            // Number of repeated solutions after an error
            reCaptchaRepeatTimes: 10,
            reCaptcha3RepeatTimes: 10,
            hCaptchaRepeatTimes: 10,
            funCaptchaRepeatTimes: 10,
            textCaptchaRepeatTimes: 10,
            awsRepeatTimes: 10,

            // ReCaptcha V3 task type: ReCaptchaV3TaskProxyLess or ReCaptchaV3M1TaskProxyLess
            reCaptcha3TaskType: 'ReCaptchaV3TaskProxyLess',

            textCaptchaSourceAttribute: 'capsolver-image-to-text-source', // ImageToText source img's attribute name
            textCaptchaResultAttribute: 'capsolver-image-to-text-result', // ImageToText result element's attribute name
        };
        `;
        await fs.writeFile(configPath, defaultConfig, { encoding: 'utf8' });
    });

    afterEach(async () => {
        await fs.unlink(configPath);
    });

    describe('addApiKey', () => {
        it('should add the API key to the config file', async () => {
            await capsolver.addApiKey();

            const { defaultConfig } = await import(configPath);
            assert.equal(defaultConfig.apiKey, apiKey);
        });

        it('should simulate 16 m1 workers concurrently adding API key to the same config', async () => {

            const promises: Promise<void>[] = [];
            for (let i = 0; i < 16; ++i) {
                promises.push(capsolver.addApiKey());
            }
            await Promise.all(promises);

            const { defaultConfig } = await import(configPath);
            assert.equal(defaultConfig.apiKey, apiKey);
        });
    });

    describe('removeApiKey', () => {
        it('should remove the API key from the config file', async () => {
            await capsolver.addApiKey();
            await capsolver.removeApiKey();

            const { defaultConfig } = await import(configPath);
            assert.equal(defaultConfig.apiKey, '');
        });
    });
});
