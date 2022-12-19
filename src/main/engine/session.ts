import { Context } from './context.js';
import { Script } from './script.js';

export const sessionHandlers: Set<SessionConstructor> = new Set();

export interface SessionLifecycleHandler {
    onSessionStart?(): Promise<void>;
    onSessionFinish?(): Promise<void>;
    onScriptRun?(script: Script): Promise<void>;
    onContextEnter?(context: Context): Promise<void>;
}

export interface SessionConstructor {
    prototype: SessionLifecycleHandler;
}

export function SessionHandler() {
    return (target: SessionConstructor) => {
        sessionHandlers.add(target);
    };
}
