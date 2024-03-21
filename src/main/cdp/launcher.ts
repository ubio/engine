import { ChildProcess, spawn } from 'child_process';
import net from 'net';
import os from 'os';
import rimraf from 'rimraf';

import { Exception } from '../exception.js';

const STANDARD_PATHS: { [index: string]: string } = {
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    linux: '/opt/google/chrome/chrome',
    win32: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
};

export class ChromeLauncher {
    childProcess: ChildProcess | null = null;
    options: ChromeLauncherOptions;

    constructor(options: Partial<ChromeLauncherOptions> = {}) {
        this.options = {
            chromePath: STANDARD_PATHS[os.platform()],
            chromeAddress: '127.0.0.1',
            chromePort: 9222,
            userDataDir: `${os.tmpdir()}/${Math.random().toString(36)}`,
            cacheDir: `${os.tmpdir()}/${Math.random().toString(36)}`,
            stdio: 'ignore',
            args: [],
            noDefaultArgs: false,
            terminateProcessOnExit: true,
            connectionTimeout: 5000,
            chromeExtensions: [],
            ...options,
        };
    }

    getDefaultArgs() {
        // Note: these are based on puppeteer's defaults and should not be controversial
        // See also: https://peter.sh/experiments/chromium-command-line-switches/

        return [
            '--allow-pre-commit-input',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-blink-features=AutomationControlled',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-cloud-import',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-sync',
            '--disable-translate',
            '--no-first-run',
            '--no-default-browser-check',
            '--no-experiments',
            '--password-store=basic',
            '--use-mock-keychain',
        ];
    }

    getEffectiveArgs(): string[] {
        const args = this.options.args.filter(Boolean) as string[];
        const defaultArgs = this.options.noDefaultArgs ? [] : this.getDefaultArgs();
        return this.mergeArgs([
            `--user-data-dir=${this.options.userDataDir}`,
            `--disk-cache-dir=${this.options.cacheDir}`,
            `--remote-debugging-port=${this.options.chromePort}`,
            `--remote-debugging-address=${this.options.chromeAddress}`,
            `--disable-extensions-except=${this.options.chromeExtensions.join(',')}`,
            ...defaultArgs,
        ], args, ['about:blank']);
    }

    async launch() {
        if (this.childProcess) {
            return await this.waitForPort();
        }
        const { chromePath, stdio } = this.options;
        const args = this.getEffectiveArgs();
        this.childProcess = spawn(chromePath, args, {
            stdio,
        });
        if (this.options.terminateProcessOnExit) {
            const exitListener = () => this.stop();
            process.addListener('exit', exitListener);
            this.childProcess.once('exit', () => process.removeListener('exit', exitListener));
        }
        this.childProcess.once('exit', () => {
            this.childProcess = null;
        });
        await this.waitForPort();
    }

    stop() {
        if (this.childProcess) {
            this.childProcess.kill();
        }
    }

    async shutdown(timeout: number) {
        await new Promise<void>(resolve => {
            if (!this.childProcess) {
                return resolve();
            }
            const timer = setTimeout(() => {
                if (this.childProcess) {
                    this.childProcess.kill('SIGKILL');
                    this.childProcess = null;
                }
                resolve();
            }, timeout);
            this.childProcess.on('exit', () => {
                clearTimeout(timer);
                resolve();
            });
            this.childProcess.kill('SIGTERM');
        });
        const { userDataDir } = this.options;
        if (userDataDir) {
            await new Promise<void>(r => {
                rimraf(userDataDir, _err => r());
            });
        }
    }

    async waitForPort() {
        const { connectionTimeout } = this.options;
        const startedAt = Date.now();
        while (Date.now() < startedAt + connectionTimeout) {
            try {
                await this.tryConnect();
                return;
            } catch (err: any) {
                await new Promise(r => setTimeout(r, 200));
            }
        }
        throw new Exception({
            name: 'ChromeLaunchFailed',
            message:
                'Could not connect to Chrome debugging port after launch. ' +
                'Make sure valid --remote-debugging-port is used and ' +
                'that another Chrome instance is not running',
            retry: false,
        });
    }

    async tryConnect() {
        const { chromePort, chromeAddress } = this.options;
        return new Promise<void>((resolve, reject) => {
            const onConnect = () => {
                socket.destroy();
                resolve();
            };
            const onError = (err: Error) => {
                socket.destroy();
                reject(err);
            };
            const socket = net.createConnection({
                host: chromeAddress,
                port: chromePort,
            });
            socket.on('connect', onConnect);
            socket.on('error', onError);
        });
    }

    mergeArgs(...argsList: string[][]) {
        const objs = argsList.map(args => this.argsToObject(args));
        return this.objectToArgs(Object.assign({}, ...objs));
    }

    protected argsToObject(args: string[]) {
        return Object.fromEntries(args.map(_ => _.split('=')));
    }

    protected objectToArgs(obj: Record<string, any>): string[] {
        return Object.entries(obj).map(_ => {
            return _.filter(Boolean).join('=');
        });
    }
}

interface ChromeLauncherOptions {
    chromePath: string;
    chromeAddress: string;
    chromePort: number;
    userDataDir: string;
    cacheDir: string;
    stdio: any;
    args: Array<string | null>;
    noDefaultArgs: boolean;
    terminateProcessOnExit: boolean;
    connectionTimeout: number;
    chromeExtensions: string[];
}
