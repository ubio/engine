import jsonPointer from 'jsonpointer';
import moment from 'moment';
import fetch from 'node-fetch';

import { Element } from './element.js';
import { Action, Context, Pipe, Pipeline, Script } from './model/index.js';
import { ApiRequest, FetchService, ProxyService, ReporterService } from './services/index.js';
import * as util from './util/index.js';

/**
 * Runtime context object for carrying state within a single action execution.
 *
 * @public
 */
export class RuntimeCtx {
    action: Action;
    context: Context;
    script: Script;
    pipe?: Pipe;

    $introspectionEnabled: boolean = false;
    $introspectionResults: IntrospectionResult[] = [];
    $introspectionSpotlight: IntrospectionSpotlight | null = null;
    $introspectionStats: IntrospectionStats = {
        pipesExecuted: 0,
        pipelinesExecuted: 0,
    };
    $stack: CtxStackFrame[] = [];
    $screenshotTaken: boolean = false;

    constructor(action: Action) {
        this.action = action;
        this.context = action.$context;
        this.script = action.$script;
        // Expose helpers and utils
        Object.assign(this, util, {
            jsonPointer,
            moment,
            fetch,
            Element,
        });
    }

    get browser() { return this.action.$browser; }
    get $browser() { return this.action.$browser; }
    get page() { return this.$browser.page; }
    get $page() { return this.$browser.page; }
    get $engine() { return this.script.$engine; }
    get $logger() { return this.action.$logger; }
    get $proxy() { return this.$engine.get(ProxyService); }
    get $api() { return this.$engine.get(ApiRequest); }
    get $fetch() { return this.$engine.get(FetchService); }

    async createDocument(value: any = {}): Promise<Element> {
        const document = await this.page.document();
        return new Element(document, value);
    }

    *allLocals(): IterableIterator<[string, Element[]]> {
        for (let i = this.$stack.length - 1; i >= 0; i--) {
            const frame = this.$stack[i];
            yield* frame.locals;
        }
    }

    getLocal(key: string): Element[] {
        for (let i = this.$stack.length - 1; i >= 0; i--) {
            const frame = this.$stack[i];
            const els = frame.locals.get(key);
            if (els) {
                return els;
            }
        }
        throw util.playbackError(`Local "${key}" not found`);
    }

    setLocal(key: string, elements: Element[]) {
        const frame = this.$stack[this.$stack.length - 1];
        if (!frame) {
            return;
        }
        frame.locals.set(key, elements);
    }

    async evalDefinition(definitionId: string, inputSet: Element[]): Promise<Element[]> {
        const def = this.script.requireDefinition(definitionId);
        const results = [];
        for (const el of inputSet) {
            const newEls = await def.pipeline.selectAll([el], this);
            results.push(...newEls);
        }
        return results;
    }

    async takeDebugScreenshot(label: string): Promise<void> {
        if (this.$screenshotTaken) {
            return;
        }
        const reporter = this.$engine.get(ReporterService);
        try {
            await reporter.sendScreenshot('debug', { label });
        } catch (error: any) {
            this.$logger.error('Debug screenshot failed', { error });
        } finally {
            this.$screenshotTaken = true;
        }
    }

}

export type IntrospectionResult = IntrospectionResultPipe | IntrospectionResultPipeline;

export interface IntrospectionResultPipe {
    pipeId: string | null;
    inputSet: Element[];
    outputSet: Element[] | null;
    nextInputSet: Element[] | null;
    error: Error | null;
    duration: number;
}

export interface IntrospectionResultPipeline {
    pipelineId: string | null;
    inputSet: Element[];
}

export interface IntrospectionSpotlight {
    pipeId: string;
    index: number;
}

export interface IntrospectionStats {
    pipesExecuted: number;
    pipelinesExecuted: number;
}

export interface CtxStackFrame {
    pipeline: Pipeline;
    locals: Map<string, Element[]>;
}
