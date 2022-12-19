import { EventEmitter } from 'events';
import fetch from 'node-fetch';

import { Exception } from '../exception.js';
import { ConsoleLogger, Logger } from '../logger.js';
import { Connection } from './connection.js';
import { Frame } from './frame.js';
import { Interceptor, InterceptorHandler } from './interceptor.js';
import { Page } from './page.js';
import { Target, TargetInitFn } from './target.js';

export interface BrowserConfig {
    chromeAddress: string;
    chromePort: number;
    cdpTimeout: number;
    navigationTimeout: number;
    stableBoxTimeout: number;
    suspendTargets: boolean;
    toolkitBinding: string;
    logger: Logger;
}

/**
 * Manages connection to Chrome browser.
 *
 * A browser instance connects to Chrome via Chrome DevTools Protocol (CDP)
 * using WebSocket endpoint (which becomes available once you start Chrome
 * with `--remote-debugging-port` flag).
 *
 * Note: even though Chrome supports multiple CDP connections; it is rarely practical
 * to establish more than one. Therefore, browser instance is commonly
 * managed as a singleton.
 *
 * @public
 */
export class Browser extends EventEmitter {
    connection: Connection;
    config: BrowserConfig;
    interceptors: Interceptor[] = [];
    targetInitFns: TargetInitFn[] = [];

    constructor(config: Partial<BrowserConfig> = {}) {
        super();
        this.config = {
            chromeAddress: '127.0.0.1',
            chromePort: 9222,
            cdpTimeout: 60000,
            navigationTimeout: 30000,
            stableBoxTimeout: 5000,
            suspendTargets: true,
            toolkitBinding: 'Autopilot',
            logger: new ConsoleLogger(),
            ...config,
        };
        this.connection = new Connection(this);
    }

    get logger(): Logger {
        return this.config.logger;
    }

    applyConfig(config: Partial<BrowserConfig>) {
        Object.assign(this.config, config);
    }

    async connect() {
        if (this.connection.isConnected()) {
            return;
        }
        const version = await this.getVersion();
        await this.connection.connect(version.webSocketDebuggerUrl);
        await this.send('Target.setAutoAttach', {
            autoAttach: true,
            waitForDebuggerOnStart: this.config.suspendTargets,
            flatten: true,
        });
        await this.send('Target.setDiscoverTargets', { discover: true });
    }

    async close() {
        await this.send('Browser.close');
    }

    disconnect() {
        this.connection.disconnect();
    }

    isConnected() {
        return this.connection.isConnected();
    }

    async newTab(browserContextId?: string): Promise<Page> {
        const { targetId } = await this.send('Target.createTarget', {
            url: 'about:blank',
            browserContextId,
        });
        const page = await this.getPage(targetId);
        if (!page) {
            throw new Exception({
                name: 'NewTabFailed',
                message: 'Create new tab failed',
            });
        }
        return page;
    }

    closeAllTabs() {
        for (const target of this.attachedTargets()) {
            if (target.type === 'page') {
                target.close();
            }
        }
    }

    getTarget(targetId: string): Target | null {
        return this.connection.findTargetById(targetId);
    }

    async getPage(targetId: string): Promise<Page | null> {
        const target = this.connection.findTargetById(targetId);
        return target ? await target.getPage() : null;
    }

    attachedTargets(): IterableIterator<Target> {
        return this.connection.attachedTargets();
    }

    *attachedPages(): IterableIterator<Page> {
        for (const target of this.attachedTargets()) {
            if (target.attachedPage) {
                yield target.attachedPage;
            }
        }
    }

    async resolveFrameById(frameId: string): Promise<Frame | null> {
        // Isolated frames are separate targets
        const target = this.connection.findTargetById(frameId);
        if (target) {
            const page = await target.getPage();
            return page.mainFrame();
        }
        // Non-isolated frames should be in other pages' frame tree
        for (const page of this.attachedPages()) {
            const frame = page.frameManager.getFrameById(frameId);
            if (frame) {
                return frame;
            }
        }
        return null;
    }

    async send(method: string, params?: any): Promise<any> {
        return await this.connection.send({ method, params });
    }

    sendAndForget(method: string, params?: any): void {
        this.connection.sendAndForget({
            method,
            params,
        });
    }

    async http(pathname: string, readJson: boolean = true) {
        const port = this.config.chromePort;
        const url = `http://${this.config.chromeAddress}:${port}${pathname}`;
        const res = await fetch(url);
        return readJson ? await res.json() : await res.text();
    }

    async getVersion(): Promise<BrowserVersion> {
        const res = await this.http('/json/version');
        return {
            browserVersion: res['Browser'],
            protocolVersion: res['Protocol-Version'],
            userAgent: res['User-Agent'],
            v8Version: res['V8-Version'],
            webkitVersion: res['WebKit-Version'],
            webSocketDebuggerUrl: res['webSocketDebuggerUrl'],
        };
    }

    async createBrowserContext(): Promise<{ browserContextId: string }> {
        const { browserContextId } = await this.send('Target.createBrowserContext');
        return { browserContextId };
    }

    async disposeBrowserContext(browserContextId: string) {
        await this.send('Target.disposeBrowserContext', { browserContextId });
    }

    interceptRequests(handler: InterceptorHandler, label: string = '') {
        const interceptor = new Interceptor(this, handler, label);
        this.interceptors.push(interceptor);
        return interceptor;
    }

    clearInterceptors(label: string = '') {
        this.interceptors = label ? this.interceptors.filter(_ => _.label !== label) : [];
    }

    addTargetInit(fn: TargetInitFn) {
        this.targetInitFns.push(fn);
    }
}

export interface BrowserVersion {
    browserVersion: string;
    protocolVersion: string;
    userAgent: string;
    v8Version: string;
    webkitVersion: string;
    webSocketDebuggerUrl: string;
}
