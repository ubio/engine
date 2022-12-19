import { Action, Context, Script } from './index.js';

export type InspectionNode = Script | Context | Action;

export enum InspectionLevel {
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
}

export interface InspectionReport {
    name: string;
    message: string;
    level: InspectionLevel;
    details?: any;
    action?: Action;
    context?: Context;
}

export interface InspectionClass {
    new(script: Script): Inspection<InspectionNode>;
}

/**
 * Allows implementing script validations and reports, accessible in Autopilot.
 *
 * @alpha
 */
export abstract class Inspection<T extends InspectionNode> {
    abstract inspect(node: T): Iterable<InspectionReport>;
}

export abstract class ScriptInspection extends Inspection<Script> {}
export abstract class ContextInspection extends Inspection<Context> {}
export abstract class ActionInspection extends Inspection<Action> {}
