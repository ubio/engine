import { EventEmitter } from 'events';

import { Exception } from '../exception.js';
import { Browser } from './browser.js';
import { stubs } from './inject/stubs.js';
import { InterceptedRequest } from './interceptor.js';
import { Page, PageNavigateOptions, PageWaitOptions } from './page.js';
import { CdpFrame, CdpLifecycleEvent, CdpLoadingFailed, CdpRequestPaused, CdpRequestWillBeSent, CdpResponse, CdpResponseReceived, CdpTargetInfo, CdpTargetType } from './types.js';

export type TargetInitFn = (target: Target) => Promise<void>;

export class Target extends EventEmitter {
    browser!: Browser;
    targetId: string;
    type: CdpTargetType;
    url: string;
    title: string;
    sessionId: string;
    browserContextId: string | null;
    openerId: string | null;

    loaded: boolean = false;
    ready: boolean = false;
    loadingFailed: boolean = false;
    requestId: string | null = null;
    errorText: string | null = null;
    response: CdpResponse | null = null;
    postData?: string;

    attachedPage: Page | null = null;
    protected initPromise: Promise<void>;

    constructor(browser: Browser, sessionId: string, targetInfo: CdpTargetInfo) {
        super();
        Object.defineProperties(this, {
            browser: {
                get: () => browser,
                enumerable: false,
            },
        });
        this.sessionId = sessionId;
        this.targetId = targetInfo.targetId;
        this.type = targetInfo.type;
        this.url = targetInfo.url;
        this.title = targetInfo.title;
        this.browserContextId = targetInfo.browserContextId || null;
        this.openerId = targetInfo.openerId || null;
        this.on('Inspector.targetCrashed', () => this.onTargetCrashed());
        this.on('Page.lifecycleEvent', ev => this.onLifecycleEvent(ev));
        this.on('Page.frameNavigated', ev => this.onFrameNavigated(ev));
        this.on('Page.domContentEventFired', () => this.onDomReady());
        this.on('Page.frameStoppedLoading', ev => this.onFrameStoppedLoading(ev));
        this.on('Network.requestWillBeSent', ev => this.onRequestWillBeSent(ev));
        this.on('Network.responseReceived', ev => this.onResponseReceived(ev));
        this.on('Network.loadingFailed', ev => this.onLoadingFailed(ev));
        this.on('Fetch.requestPaused', ev => this.onRequestPaused(ev));
        this.initPromise = this._init();
    }

    get logger() {
        return this.browser.logger;
    }

    async getPage(): Promise<Page> {
        await this.init();
        if (!this.attachedPage) {
            throw new Exception({
                name: 'TargetDestroyed',
                message: 'Cannot obtain page because the target is destroyed'
            });
        }
        return this.attachedPage;
    }

    init(): Promise<void> {
        return this.initPromise;
    }

    protected async _init() {
        try {
            if (this.openerId) {
                // In headless Chrome, popups hang unless runIfWaitingForDebugger is executed first
                await this.send('Runtime.runIfWaitingForDebugger');
            }
            await this.send('Fetch.enable');
            await this.send('Page.enable');
            await this.send('Page.setLifecycleEventsEnabled', { enabled: true });

            await this.send('Page.addScriptToEvaluateOnNewDocument', {
                source: `(${stubs.toString()})()`
            });

            const { frameTree } = await this.send('Page.getFrameTree');
            this.attachedPage = new Page(this, frameTree);
            await this.send('Network.enable', {
                maxTotalBufferSize: 100 * 1024 * 1204,
                maxResourceBufferSize: 50 * 1024 * 1204,
            });

            for (const fn of this.browser.targetInitFns) {
                await fn(this);
            }
            await this.send('Runtime.runIfWaitingForDebugger');
            this.browser.emit('pageCreated', this.attachedPage);
        } catch (error: any) {
            if (['CdpDisconnected', 'CdpTargetDetached'].includes(error.name)) {
                return;
            }
            this.browser.logger.error('Target init failed', {
                error,
                ...this.collectInfo(),
            });
        }
    }

    async activate() {
        const { targetId } = this;
        await this.browser.send('Target.activateTarget', { targetId });
    }

    close() {
        const { targetId } = this;
        this.browser.sendAndForget('Target.closeTarget', { targetId });
    }

    async send(method: string, params?: any, timeout?: number) {
        const { sessionId } = this;
        return await this.browser.connection.send({
            method,
            params,
            sessionId,
            timeout,
        });
    }

    sendAndForget(method: string, params?: any) {
        const { sessionId } = this;
        this.browser.connection.sendAndForget({
            method,
            params,
            sessionId,
        });
    }

    updateInfo(targetInfo: CdpTargetInfo) {
        this.type = targetInfo.type;
        this.url = targetInfo.url;
        this.title = targetInfo.title;
    }

    onInfoChanged(targetInfo: CdpTargetInfo) {
        this.updateInfo(targetInfo);
    }

    async refreshInfo() {
        const { targetInfo } = await this.send('Target.getTargetInfo');
        this.updateInfo(targetInfo);
    }

    isPageTarget() {
        return ['iframe', 'page'].includes(this.type);
    }

    isValidTarget(): boolean {
        if (!this.isPageTarget()) {
            return false;
        }
        // Chrome currently leaks targets on Linux and Windows, so these are
        // heuristics to avoid sending commands to dysfunctional targets
        if (this.type === 'page') {
            return !!this.url && this.url !== 'about:blank';
        }
        return true;
    }

    collectInfo() {
        return {
            targetId: this.targetId,
            url: this.url,
            type: this.type,
        };
    }

    async navigate(url: string, options: PageNavigateOptions = {}): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.send('Page.navigate', { url }).catch(reject);
            this.ready = false;
            this.loaded = false;
            this.loadingFailed = false;
            this.waitForReady(options).then(resolve, reject);
        });
    }

    async waitForReady(options: PageNavigateOptions = {}): Promise<void> {
        await this.waitForEvents({
            events: ['ready', 'loaded'],
            ...options,
        });
    }

    async waitForLoad(options: PageNavigateOptions = {}): Promise<void> {
        await this.waitForEvents({
            events: ['loaded'],
            ...options,
        });
    }

    private async waitForEvents(options: PageWaitOptions): Promise<void> {
        const {
            events,
            rejectHttpErrors = true,
            rejectNetworkErrors = true,
            rejectTimeout = true,
            timeout = this.browser.config.navigationTimeout,
        } = options;
        const eventsHappened = events.some(ev => (this as any)[ev] === true);
        if (eventsHappened) {
            return;
        }
        await new Promise<void>((resolve, reject) => {
            const cleanup = () => {
                clearTimeout(timer!);
                for (const ev of events) {
                    this.removeListener(ev, onResolve);
                }
            };
            const onTimeout = () => {
                cleanup();
                if (rejectTimeout) {
                    const err = new Exception({
                        name: 'NavigationTimeout',
                        message: `Page did not resolve to one of following states: ${events.join(', ')}`,
                        retry: false,
                        details: this.collectInfo(),
                    });
                    reject(err);
                } else {
                    resolve();
                }
            };
            const onResolve = () => {
                cleanup();
                const status = this.response?.status;
                if (rejectHttpErrors && status! >= 400) {
                    const err = new Exception({
                        name: 'NavigationFailed',
                        message: `Page navigation failed with HTTP status ${status}`,
                        retry: false,
                        details: this.collectInfo(),
                    });
                    return reject(err);
                }
                if (rejectNetworkErrors && this.loadingFailed) {
                    const err = new Exception({
                        name: 'NavigationFailed',
                        message: `Page failed to load: ${this.errorText || '<reason unknown>'}`,
                        retry: false,
                        details: this.collectInfo(),
                    });
                    return reject(err);
                }
                resolve();
            };
            const timer = timeout ? setTimeout(onTimeout, timeout) : null;
            for (const ev of events) {
                this.addListener(ev, onResolve);
            }
        });
    }

    private onRequestWillBeSent(event: CdpRequestWillBeSent) {
        const { type, frameId, requestId, request } = event;
        if (type !== 'Document' || this.targetId !== frameId) {
            return;
        }
        this.requestId = requestId;
        this.loadingFailed = false;
        this.errorText = null;
        this.response = null;
        this.postData = request.postData;
    }

    private onResponseReceived(event: CdpResponseReceived) {
        const { type, response, requestId } = event;
        if (type !== 'Document' || this.requestId !== requestId) {
            return;
        }
        this.response = response;
    }

    private onLoadingFailed(event: CdpLoadingFailed) {
        const { requestId, type, errorText } = event;
        if (type !== 'Document' || this.requestId !== requestId) {
            return;
        }
        this.loadingFailed = true;
        this.errorText = errorText;
    }

    private onTargetCrashed() {
        const { sessionId } = this;
        const err = new Exception({
            name: 'CdpTargetCrashed',
            message: 'CDP: Target crashed unexpectedly',
        });
        this.browser.connection.rejectAllForTarget(sessionId, () => err);
        this.emit('crash');
    }

    private onLifecycleEvent(ev: CdpLifecycleEvent) {
        if (ev.frameId !== this.targetId) {
            return;
        }
        switch (ev.name) {
            case 'init':
                this.ready = false;
                this.loaded = false;
                break;
            case 'DOMContentLoaded':
                this.ready = true;
                this.emit('ready');
                break;
            case 'load':
                this.ready = true;
                this.emit('ready');
                this.loaded = true;
                this.emit('loaded');
                break;
        }
    }

    private onFrameNavigated(ev: { frame: CdpFrame }) {
        if (ev.frame.id !== this.targetId) {
            return;
        }
        this.loaded = false;
        this.ready = false;
        this.loadingFailed = !!ev.frame.unreachableUrl;
        this.url = ev.frame.unreachableUrl || ev.frame.url;
        if (['iframe', 'page'].includes(this.type)) {
            this.logger.debug(`Navigate (${this.type}) ${this.url}`, {
                ...this.collectInfo(),
            });
        }
    }

    private onFrameStoppedLoading(ev: { frameId: string }) {
        if (ev.frameId !== this.targetId) {
            return;
        }
        this.ready = true;
        this.loaded = true;
        this.emit('ready');
        this.emit('loaded');
    }

    private onDomReady() {
        this.ready = true;
        this.emit('ready');
    }

    private async onRequestPaused(ev: CdpRequestPaused) {
        const ireq = new InterceptedRequest(this, ev);
        for (const interceptor of this.browser.interceptors) {
            try {
                const outcome = await interceptor.handler(ireq);
                if (outcome && outcome.method !== 'pass') {
                    await this.send(outcome.method, outcome.params);
                    return;
                }
            } catch (error: any) {
                this.logger.warn('Request interception failed', {
                    error,
                    ...this.collectInfo(),
                });
            }
        }
        const continuePayload = ireq.continue();
        this.sendAndForget(continuePayload.method, continuePayload.params);
    }
}
