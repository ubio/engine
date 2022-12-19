import { Exception, ExceptionSpec } from '../cdp/index.js';

/**
 * An exception with indication that a specific error occurs from
 * explicitly scripted flow (e.g. raised by `Flow.expect`) rather
 * than thrown by the Engine or other components.
 *
 * @internal
 */
export class ScriptException extends Exception {
    scriptError: boolean = false;

    constructor(spec: ExceptionSpec & { scriptError?: boolean }) {
        super(spec);
        this.scriptError = spec.scriptError || false;
    }
}
