import * as util from './cdp-util.js';
import { DomManager } from './dom.js';
import { Frame } from './frame.js';
import { FrameManager } from './frame-manager.js';
import { InputManager } from './input-manager.js';
import { NetworkManager } from './network-manager.js';
import { RemoteElement } from './remote-element.js';
import { RemoteObject } from './remote-object.js';
import { ScreenshotManager } from './screenshot-manager.js';
import { Target } from './target.js';
import { CdpCookie, CdpFrameTree, CdpLayoutMetrics, RemoteExpression } from './types.js';

/**
 * Represents a page CDP target.
 *
 * This class takes care of various page lifecycle duties, which include:
 *
 *   - mirroring frame tree structure,
 *   - tracking execution contexts,
 *   - tracking network activity and interception,
 *   - maintaining emulation settings.
 *
 * A single page instance typically corresponds to a tab.
 */
export class Page {
    domManager: DomManager;
    frameManager: FrameManager;
    inputManager: InputManager;
    networkManager: NetworkManager;
    screenshotManager: ScreenshotManager;

    constructor(public target: Target, frameTree: CdpFrameTree) {
        this.domManager = new DomManager(this);
        this.frameManager = new FrameManager(this, frameTree);
        this.inputManager = new InputManager(this);
        this.networkManager = new NetworkManager(this);
        this.screenshotManager = new ScreenshotManager(this);
    }

    get browser() {
        return this.target.browser;
    }

    get logger() {
        return this.target.logger;
    }

    get toolkitBinding() {
        return this.browser.config.toolkitBinding;
    }

    async send(method: string, params?: any, timeout?: number): Promise<any> {
        return await this.target.send(method, params, timeout);
    }

    sendAndForget(method: string, params?: any): void {
        this.target.sendAndForget(method, params);
    }

    async activate() {
        await this.target.activate();
        await this.send('Page.bringToFront');
    }

    close() {
        this.target.close();
    }

    mainFrame(): Frame {
        return this.frameManager.mainFrame!;
    }

    allFrames(): IterableIterator<Frame> {
        return this.frameManager.frames.values();
    }

    url() {
        return this.target.url;
    }

    async navigate(url: string, options: PageNavigateOptions = {}): Promise<void> {
        await this.target.navigate(url, options);
    }

    async waitForReady(options: PageNavigateOptions = {}): Promise<void> {
        await this.target.waitForReady(options);
    }

    async waitForLoad(options: PageNavigateOptions = {}): Promise<void> {
        await this.target.waitForLoad(options);
    }

    async waitForAnimationFrame(timeout: number = 1000): Promise<void> {
        await Promise.race([
            this.evaluate(() => {
                return new Promise(r => requestAnimationFrame(r));
            }),
            new Promise(r => setTimeout(r, timeout)),
        ]);
    }

    async evaluate(pageFn: RemoteExpression, ...args: any[]): Promise<RemoteObject> {
        return await this.mainFrame().evaluate(pageFn, ...args);
    }

    async evaluateElement(pageFn: RemoteExpression, ...args: any[]): Promise<RemoteElement | null> {
        return await this.mainFrame().evaluateElement(pageFn, ...args);
    }

    async evaluateJson(pageFn: RemoteExpression, ...args: any[]): Promise<any> {
        return await this.mainFrame().evaluateJson(pageFn, ...args);
    }

    async evaluateOnNewDocument(pageFn: RemoteExpression, ...args: any[]): Promise<any> {
        const source = util.evaluationString(pageFn, ...args);
        await this.send('Page.addScriptToEvaluateOnNewDocument', {
            source,
        });
    }

    async document(): Promise<RemoteElement> {
        return await this.mainFrame().document();
    }

    async querySelectorAll(selector: string): Promise<RemoteElement[]> {
        return (await this.document()).querySelectorAll(selector);
    }

    async querySelector(selector: string): Promise<RemoteElement | null> {
        return (await this.document()).querySelector(selector);
    }

    async getLayoutMetrics(): Promise<CdpLayoutMetrics> {
        return await this.send('Page.getLayoutMetrics');
    }

    async grabHtmlSnapshot(): Promise<string> {
        return await this.evaluateJson(toolkitBinding => {
            return (window as any)[toolkitBinding].htmlSnapshot();
        }, this.toolkitBinding);
    }

    async captureHtmlSnapshot(): Promise<string> {
        return await this.mainFrame().captureHtmlSnapshot();
    }

    async clearBrowsingData() {
        await this.send('Storage.clearDataForOrigin', {
            origin: '*',
            storageTypes: [
                'appcache',
                'cookies',
                'file_systems',
                'indexeddb',
                'local_storage',
                'websql',
                'service_workers',
                'interest_groups',
                'shared_storage',
                'storage_buckets',
                'other',
            ].join(','),
        });
        await this.send('Network.clearBrowserCookies');
    }

    async resolveFrameById(frameId: string): Promise<Frame | null> {
        return this.browser.resolveFrameById(frameId);
    }

    async getAllCookies(): Promise<CdpCookie[]> {
        const { cookies } = await this.send('Network.getAllCookies');
        return cookies;
    }

    async setCookies(cookies: CdpCookie[]) {
        await this.send('Network.setCookies', { cookies });
    }

    async getFrameTree(): Promise<CdpFrameTree> {
        const { frameTree } = await this.send('Page.getFrameTree');
        return frameTree;
    }

}

export interface PageWaitOptions extends PageNavigateOptions {
    events: Array<'ready' | 'loaded' | 'networkAlmostIdle' | 'networkIdle'>;
}

export interface PageNavigateOptions {
    timeout?: number;
    rejectHttpErrors?: boolean;
    rejectNetworkErrors?: boolean;
    rejectTimeout?: boolean;
}
