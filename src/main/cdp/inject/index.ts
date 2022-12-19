import { exposeAudioUtils } from './audio-utils.js';
import { stubs } from './stubs.js';
import { toolkit } from './toolkit.js';

export interface ContentScript {
    filename: string;
    fn: Function;
}

export const runtimeScripts: ContentScript[] = [
    { filename: 'toolkit.js', fn: toolkit },
    { filename: 'audio-utils.js', fn: exposeAudioUtils },
];

export const stubScripts: ContentScript[] = [
    { filename: 'stubs.js', fn: stubs }
];
