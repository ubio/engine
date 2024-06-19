import assert from 'assert';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { CapsolverChromeExtension, loadConfigFromJs, saveConfigToJs } from '../../../main/cdp/capsolver-chrome-extension';


describe('CapsolverChromeExtension', () => {
    let capsolver: CapsolverChromeExtension;
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

        const defaultConfig = `export const defaultConfig = {
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
  enabledForAwsCaptcha: true,

  reCaptchaMode: 'click',
  hCaptchaMode: 'click',

  reCaptchaDelayTime: 0,
  hCaptchaDelayTime: 0,
  textCaptchaDelayTime: 0,
  awsDelayTime: 0,

  reCaptchaRepeatTimes: 10,
  reCaptcha3RepeatTimes: 10,
  hCaptchaRepeatTimes: 10,
  funCaptchaRepeatTimes: 10,
  textCaptchaRepeatTimes: 10,
  awsRepeatTimes: 10,

  reCaptcha3TaskType: 'ReCaptchaV3TaskProxyLess',

  textCaptchaSourceAttribute: 'capsolver-image-to-text-source',
  textCaptchaResultAttribute: 'capsolver-image-to-text-result',
};`;
        await saveConfigToJs(configPath, defaultConfig);
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
