import { EventEmitter } from 'events';

import { Exception } from '../exception.js';
import { asyncRegexpReplace } from './cdp-util.js';
import { ExecutionContext } from './execution-context.js';
import { runtimeScripts, stubScripts } from './inject/index.js';
import { Page } from './page.js';
import { RemoteElement } from './remote-element.js';
import { RemoteObject } from './remote-object.js';
import { CdpFrame, RemoteExpression } from './types.js';

/**
 * Represents a single frame (may correspond to page's main frame or any of the child frames).
 */
export class Frame extends EventEmitter {
    childFrames: Set<Frame> = new Set();
    // Lifecycle state, synced via Page.* events
    loaded: boolean = false;
    ready: boolean = false;
    failed: boolean = false;
    url: string = '';
    securityOrigin: string = '';
    mimeType: string = '';

    protected _isolatedWorld: ExecutionContext | null = null;
    protected _defaultExecCtx: ExecutionContext | null = null;

    constructor(
        public page: Page,
        public frameId: string,
        public parentFrame?: Frame,
    ) {
        super();
        if (parentFrame) {
            parentFrame.childFrames.add(this);
        }
        this.clearExecutionContexts();
    }

    get logger() {
        return this.page.logger;
    }

    isMainFrame() {
        return !this.parentFrame;
    }

    async getCurrentExecutionContext() {
        // Note: we can implement logic to switch between isolated world and default exec context here
        if (this._isolatedWorld && this._isolatedWorld.isAlive) {
            return this._isolatedWorld;
        }
        return await this.initIsolatedWorld();
    }

    protected async initIsolatedWorld() {
        const { executionContextId } = await this.page.target.send('Page.createIsolatedWorld', {
            frameId: this.frameId,
            worldName: 'Autopilot',
            grantUniveralAccess: true,
        });
        this._isolatedWorld = new ExecutionContext(this, executionContextId);
        this._isolatedWorld.initContentScripts(runtimeScripts);
        return this._isolatedWorld;
    }

    async getDefaultExecutionContext(): Promise<ExecutionContext> {
        if (!this._defaultExecCtx) {
            return await this.getCurrentExecutionContext();
        }
        return this._defaultExecCtx;
    }

    clearExecutionContexts() {
        this._defaultExecCtx = null;
        this._isolatedWorld = null;
    }

    async evaluate(pageFn: RemoteExpression, ...args: any[]): Promise<RemoteObject> {
        return await this.withRetryOnContextLoss(async execContext => {
            return await execContext.evaluate(pageFn, ...args);
        });
    }

    async evaluateElement(pageFn: RemoteExpression, ...args: any[]): Promise<RemoteElement | null> {
        return await this.withRetryOnContextLoss(async execContext => {
            return await execContext.evaluateElement(pageFn, ...args);
        });
    }

    async evaluateJson(pageFn: RemoteExpression, ...args: any[]): Promise<any> {
        return await this.withRetryOnContextLoss(async execContext => {
            return await execContext.evaluateJson(pageFn, ...args);
        });
    }

    async document(): Promise<RemoteElement> {
        try {
            return (await this.evaluateElement(() => document))!;
        } catch (err: any) {
            throw new Exception({
                name: 'PageLoadingFailed',
                message: 'Failed to obtain top frame document',
                retry: true,
                details: {
                    cause: {
                        message: err.message,
                        code: err.code,
                        details: err.details,
                    },
                },
            });
        }
    }

    async querySelectorAll(selector: string): Promise<RemoteElement[]> {
        return (await this.document()).querySelectorAll(selector);
    }

    async querySelector(selector: string): Promise<RemoteElement | null> {
        return (await this.document()).querySelector(selector);
    }

    onNavigated(cdpFrame: CdpFrame) {
        this.loaded = false;
        this.ready = false;
        this.failed = !!cdpFrame.unreachableUrl;
        this.url = cdpFrame.unreachableUrl || cdpFrame.url;
        this.securityOrigin = cdpFrame.securityOrigin;
        this.mimeType = cdpFrame.mimeType;
        this.emit('navigate');
        if (['iframe', 'page'].includes(this.page.target.type)) {
            this.logger.debug(`Navigate (${this.page.target.type}) ${this.url}`, {
                frameId: this.frameId,
                url: this.url,
            });
        }
    }

    onStoppedLoading() {
        this.ready = true;
        this.loaded = true;
        this.emit('ready');
        this.emit('loaded');
    }

    onExecutionContextCreated(context: any) {
        const { id, auxData = {} } = context;
        if (auxData.isDefault) {
            const exCtx = new ExecutionContext(this, id);
            exCtx.initContentScripts(stubScripts);
            this._defaultExecCtx = exCtx;
        }
    }

    onExecutionContextDestroyed(executionContextId: string) {
        if (this._defaultExecCtx && this._defaultExecCtx.executionContextId === executionContextId) {
            this.clearExecutionContexts();
        }
    }

    onExecutionContextsCleared() {
        this.clearExecutionContexts();
    }

    async captureHtmlSnapshot(): Promise<string> {
        await this.page.waitForReady({ timeout: 5000, rejectHttpErrors: false }).catch(error => {
            this.logger.warn('Capture html snapshot: Failed waiting for page to be ready', { error });
        });
        await this.htmlSnapshotPopulateFrameIds();
        const snapshot = await this.htmlSnapshotEvalWithFrameRefs();
        return await this.htmlSnapshotResolveFrameRefs(snapshot);
    }

    private async htmlSnapshotPopulateFrameIds(): Promise<void> {
        const frames = await this.querySelectorAll('iframe, frame');
        const nodeInfosPromises = frames.map(frame => this.page.send('DOM.describeNode', { objectId: frame.objectId }));
        const nodeInfos = await Promise.all(nodeInfosPromises);
        const frameIds = nodeInfos.map(nodeInfo => nodeInfo.node.frameId);
        await this.evaluateJson(
            (frameIds: string[], ...frames: any[]) => {
                for (let i = 0; i < frames.length; i++) {
                    frames[i].__ubioFrameId = frameIds[i];
                }
            },
            frameIds,
            ...frames,
        );
    }

    private async htmlSnapshotEvalWithFrameRefs(): Promise<string> {
        try {
            return await this.evaluateJson(toolkitBinding => {
                return (window as any)[toolkitBinding].htmlSnapshot();
            }, this.page.toolkitBinding);
        } catch (err: any) {
            return await this.evaluateJson(() => document.documentElement!.outerHTML);
        }
    }

    private async htmlSnapshotResolveFrameRefs(snapshot: string): Promise<string> {
        // See toolkit.ts for more info
        const frameMarkerRegex = /------@@(.*?):\d+@@------/g;
        const result = await asyncRegexpReplace(snapshot, frameMarkerRegex, async m => {
            const frameId = m[1];
            const frame = await this.page.resolveFrameById(frameId);
            if (!frame) {
                return 'data:text;frame content unavailable';
            }
            // Grab iframe snapshot, serialize it and insert as srcdoc
            const html = await frame.captureHtmlSnapshot();
            const htmlBase64 = Buffer.from(html).toString('base64');
            return `data:text/html;base64,${htmlBase64}"`;
        });
        return result;
    }

    private async withRetryOnContextLoss<T>(fn: (ctx: ExecutionContext) => Promise<T>): Promise<T> {
        let ctx = await this.getCurrentExecutionContext();
        try {
            return await fn(ctx);
        } catch (err: any) {
            if (/Cannot find context with specified id/.test(err.message)) {
                // Recreate isolated world and retry once
                this._isolatedWorld = null;
                ctx = await this.getCurrentExecutionContext();
                return await fn(ctx);
            }
            throw err;
        }
    }
}
