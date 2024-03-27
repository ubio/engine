import assert from 'assert';
import path from 'path';

import { ChromeLauncher } from '../cdp/index.js';
import { Element } from './element.js';
import { Engine } from './engine.js';
import { Extension } from './extension.js';
import { FlowServiceMock } from './mocks/index.js';
import { Pipeline, Script } from './model/index.js';
import { BrowserService, FlowService, ProxyService } from './services/index.js';

class UnexpectedSuccessError extends Error {
    code: string = 'UnexpectedSuccess';
}

/**
 * Utility class for simplifying common tests.
 *
 * @beta
 */
export class TestRig {
    engine: Engine;
    launcher: ChromeLauncher;

    chromePort = Number(process.env.CHROME_PORT) || 9123;
    chromeAddress = process.env.CHROME_ADDRESS ?? '127.0.0.1';
    chromePath = process.env.CHROME_PATH ?? undefined;
    chromeArgs = process.env.CHROME_ARGS ?? '';

    constructor() {
        this.engine = new Engine();
        this.launcher = new ChromeLauncher({
            chromeAddress: this.chromeAddress,
            chromePort: this.chromePort,
            chromePath: this.chromePath,
            userDataDir: path.resolve(process.cwd(), '.tmp/chromedata'),
            args: this.getChromeArgs(),
        });
    }

    getChromeArgs() {
        return [
            `--proxy-server=http://localhost:${this.proxy.getProxyPort()}`,
            ...this.chromeArgs.split(/\s+/).filter(Boolean),
        ];
    }

    getChromeAdditionalArgs(): string[] {
        return [];
    }

    /**
     * Override this to setup engine service bindings.
     */
    setupEngine() {
        this.engine.container.bind(FlowServiceMock).toSelf().inSingletonScope();
        this.engine.container.rebind(FlowService).toService(FlowServiceMock);
    }

    async beforeAll() {
        await this.launcher.launch();
    }

    async afterAll() {
        await this.launcher.shutdown(1000);
    }

    async beforeEach() {
        this.engine = new Engine();
        this.setupEngine();
        await this.engine.startSession();
        await this.browser.connect();
        await this.openNewTab();
    }

    async afterEach() {
        await this.engine.finishSession();
        await this.closeTab();
        this.browser.disconnect();
    }

    get browser() {
        return this.engine.get(BrowserService);
    }

    get page() {
        return this.browser.page;
    }

    get flow() {
        return this.engine.get(FlowServiceMock);
    }

    get proxy() {
        return this.engine.get(ProxyService);
    }

    async openNewTab() {
        const { browserContextId } = await this.browser.createBrowserContext();
        const tab = await this.browser.newTab(browserContextId);
        await this.browser.attach(tab.target.targetId);
        for (const other of this.browser.attachedTargets()) {
            if (other.targetId !== tab.target.targetId) {
                other.close();
            }
        }
    }

    async closeTab() {
        const { page } = this;
        page.close();
        if (page.target.browserContextId) {
            await this.browser.disposeBrowserContext(page.target.browserContextId);
        }
        this.browser.detach();
    }

    createScript(spec: any): Script {
        return new Script(this.engine, spec);
    }

    createScriptWithActions(actions: any[]): Script {
        return this.createScript({
            name: 'test',
            contexts: [{ type: 'main', actions }],
        });
    }

    createPipeline(pipes: any[]): Pipeline {
        const script = this.createScript({});
        const context = script.getMainContext();
        const def = context.definitions.insert({
            type: 'definition',
            pipeline: pipes,
        }, 0);
        return (def as any).pipeline;
    }

    async runPipes(pipes: any[]): Promise<Element[]> {
        const pipeline = this.createPipeline(pipes);
        return this.runPipeline(pipeline);
    }

    async runPipeline(pipeline: Pipeline): Promise<Element[]> {
        const inputSet = await pipeline.$action.resolveScope();
        return await pipeline.selectAll(inputSet, pipeline.$action.createCtx());
    }

    async runActions(actions: any[]): Promise<void> {
        const script = this.createScriptWithActions(actions);
        await script.runAll();
    }

    async assertError(code: string, asyncFn: () => any): Promise<Error> {
        try {
            await asyncFn();
            throw new UnexpectedSuccessError();
        } catch (err: any) {
            assert.equal(err.code, code);
            return err;
        }
    }

}

export class ExtensionTestRig extends TestRig {
    extension!: Extension;

    constructor(public extensionDir: string) {
        super();
    }

    /**
     * Override this to setup extension service bindings.
     */
    setupExtension() {}

    get container() {
        return this.extension.container;
    }

    override async beforeAll() {
        await super.beforeAll();
    }

    override async beforeEach() {
        this.engine = new Engine();
        this.setupEngine();
        this.extension = await Extension.load(this.extensionDir);
        this.engine.addExtension(this.extension);
        this.setupExtension();
        await this.engine.startSession();
        await this.browser.connect();
        await this.openNewTab();
    }

}
