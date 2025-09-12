import { Frame } from './frame.js';
import { Page } from './page.js';
import {
    CdpFrame,
    CdpFrameTree,
} from './types';

/**
 * Keeps track of page frames.
 *
 * @internal
 */
export class FrameManager {
    page: Page;
    frames: Map<string, Frame> = new Map();
    mainFrame: Frame;

    constructor(page: Page, frameTree: CdpFrameTree) {
        this.page = page;
        const { target } = page;
        this.mainFrame = this.registerFrame(frameTree.frame.id);
        this.registerFrameTree(frameTree);
        target.on('Page.frameAttached', ev => this.onFrameAttached(ev.frameId, ev.parentFrameId));
        target.on('Page.frameNavigated', ev => this.onFrameNavigated(ev.frame));
        target.on('Page.navigatedWithinDocument', ev => this.onNavigatedWithinDocument(ev.frameId, ev.url));
        target.on('Page.frameDetached', ev => this.onFrameDetached(ev.frameId, ev.reason));
        target.on('Page.frameStoppedLoading', ev => this.onFrameStoppedLoading(ev.frameId));
    }

    getFrameById(id: string): Frame | undefined {
        return this.frames.get(id);
    }

    private registerFrameTree(frameTree: CdpFrameTree) {
        const { frame, childFrames } = frameTree;
        if (frame.parentId) {
            this.onFrameAttached(frame.id, frame.parentId);
        }
        this.onFrameNavigated(frame);
        if (childFrames) {
            for (const child of childFrames) {
                this.registerFrameTree(child);
            }
        }
    }

    private registerFrame(frameId: string, parentFrameId?: string): Frame {
        if (this.frames.has(frameId)) {
            return this.frames.get(frameId)!;
        }
        const parentFrame = parentFrameId ? this.getFrameById(parentFrameId) : undefined;
        const frame = new Frame(this.page, frameId, parentFrame);
        this.frames.set(frameId, frame);
        if (!parentFrameId) {
            this.mainFrame = frame;
        }
        return frame;
    }

    private unregisterFrame(frame: Frame) {
        this.frames.delete(frame.frameId);
        if (frame.parentFrame) {
            frame.parentFrame.childFrames.delete(frame);
        }
        for (const child of frame.childFrames) {
            this.unregisterFrame(child);
        }
    }

    private onFrameAttached(frameId: string, parentFrameId: string) {
        this.registerFrame(frameId, parentFrameId);
    }

    private onFrameNavigated(cdpFrame: CdpFrame) {
        const { id, parentId } = cdpFrame;
        const existingFrame = this.getFrameById(id);
        if (existingFrame) {
            // Detach children
            for (const child of existingFrame.childFrames) {
                this.unregisterFrame(child);
            }
            // Update frame id to retain frame identity on cross-process navigation
            if (existingFrame.isMainFrame()) {
                existingFrame.frameId = id;
                this.frames.delete(id);
                this.frames.set(id, existingFrame);
            }
            // Update navigation status
            existingFrame.onNavigated(cdpFrame);
        } else {
            // Initial top-frame navigation
            const newFrame = this.registerFrame(id, parentId);
            newFrame.onNavigated(cdpFrame);
        }
    }

    private onNavigatedWithinDocument(frameId: string, url: string) {
        const frame = this.getFrameById(frameId);
        if (frame) {
            frame.url = url;
        }
    }

    private onFrameDetached(frameId: string, reason: 'remove' | 'swap') {
        const frame = this.getFrameById(frameId);
        if (frame) {
            if (reason === 'swap') {
                this.page.logger.debug('Frame swapped', { frameId });
            }
            this.unregisterFrame(frame);
        }
    }

    private onFrameStoppedLoading(frameId: string) {
        const frame = this.getFrameById(frameId);
        if (frame) {
            frame.onStoppedLoading();
        }
    }

}
