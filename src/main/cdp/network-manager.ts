import { convertHeadersToEntries, convertHeadersToObject } from './cdp-util.js';
import { Exception } from './exception.js';
import { Page } from './page.js';
import {
    CdpHeaderEntry,
    CdpHeaders,
    CdpLoadingFailed,
    CdpLoadingFinished,
    CdpRequest,
    CdpRequestWillBeSent,
    CdpResponse,
    CdpResponseReceived,
} from './types';

const IGNORE_REQUEST_LOG_TYPES = ['Image', 'Font', 'Stylesheet', 'Media'];

/**
 * Manages Page networking layer.
 *
 * This class exposes useful network-related functionality such as:
 *
 *   - waiting for "network silence" (i.e. no new requests fired for specified duration)
 *   - accessing request/response information on current target (since last page load event,
 *     similar to DevTools)
 *   - obtaining request/response body of selected requests (with same limitations as in DevTools)
 */
export class NetworkManager {
    pendingRequestIds: Set<string> = new Set();
    collectedResources: NetworkResource[] = [];
    lastNetworkEventAt: number = 0;

    constructor(public page: Page) {
        page.target.on('Network.requestWillBeSent', ev => this.onRequestWillBeSent(ev));
        page.target.on('Network.responseReceived', ev => this.onResponseReceived(ev));
        page.target.on('Network.loadingFinished', ev => this.onLoadingFinished(ev));
        page.target.on('Network.loadingFailed', ev => this.onLoadingFailed(ev));
    }

    get logger() {
        return this.page.logger;
    }

    isSilent(): boolean {
        return this.pendingRequestIds.size === 0;
    }

    isSilentFor(duration: number): boolean {
        return this.isSilent() && this.lastNetworkEventAt + duration < Date.now();
    }

    invalidate() {
        this.collectedResources = [];
        this.pendingRequestIds.clear();
    }

    getCollectedResources(): NetworkResource[] {
        return this.collectedResources;
    }

    getPendingRequests(): NetworkResource[] {
        const results: NetworkResource[] = [];
        for (const requestId of this.pendingRequestIds) {
            const res = this.getResourceById(requestId);
            if (res) {
                results.push(res);
            }
        }
        return results;
    }

    getResourceById(requestId: string): NetworkResource | null {
        return this.collectedResources.find(_ => _.requestId === requestId) || null;
    }

    async getResponseBody(requestId: string): Promise<Buffer> {
        const { body, base64Encoded } = await this.page.send('Network.getResponseBody', { requestId });
        return Buffer.from(body, base64Encoded ? 'base64' : 'utf-8');
    }

    async waitForFinish(requestId: string, timeout: number = 30000) {
        return await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(onTimeout, timeout);
            const { target } = this.page;
            target.addListener('Network.loadingFinished', onFinished);
            target.addListener('Network.loadingFailed', onFailed);
            const rs = this.collectedResources.find(rs => rs.requestId === requestId);
            if (rs && rs.status === 'loadingFinished') {
                return onFinished(rs);
            }
            if (rs && rs.status === 'loadingFailed') {
                return onFailed(rs);
            }

            function cleanup() {
                clearTimeout(timer);
                target.removeListener('Network.loadingFinished', onFinished);
                target.removeListener('Network.loadingFailed', onFailed);
            }

            function onFinished(rs: NetworkResource) {
                if (rs.requestId === requestId) {
                    cleanup();
                    resolve();
                }
            }

            function onFailed(rs: NetworkResource) {
                if (rs.requestId === requestId) {
                    cleanup();
                    reject(
                        new Exception({
                            name: 'NetworkRequestFailed',
                            message: 'Resource loading has failed',
                            retry: false,
                        }),
                    );
                }
            }

            function onTimeout() {
                cleanup();
                reject(
                    new Exception({
                        name: 'NetworkRequestTimeout',
                        message: 'Timeout while waiting for resource to load',
                        retry: false,
                    }),
                );
            }
        });
    }

    private onRequestWillBeSent(ev: CdpRequestWillBeSent) {
        const { requestId, frameId, type, request } = ev;
        // Chrome's DevTools discard collected requests after main frame navigates.
        // There are no events for top frame navigation, so we'll simply clean things here
        // based on request type and frameId
        const topFrame = this.page.mainFrame();
        if (frameId === topFrame.frameId && type === 'Document') {
            this.invalidate();
        }
        this.lastNetworkEventAt = Date.now();
        this.pendingRequestIds.add(requestId);
        this.collectedResources.push({
            requestId,
            frameId,
            type,
            status: 'requestWillBeSent',
            localSendTimestamp: Date.now(),
            request,
        });
    }

    private onResponseReceived(ev: CdpResponseReceived) {
        this.lastNetworkEventAt = Date.now();
        const rs = this.getResourceById(ev.requestId);
        if (rs) {
            rs.response = ev.response;
            rs.status = 'responseReceived';
            if (ev.response.status >= 400) {
                this.logHttpError(rs);
            }
        }
    }

    private onLoadingFinished(ev: CdpLoadingFinished) {
        this.lastNetworkEventAt = Date.now();
        this.pendingRequestIds.delete(ev.requestId);
        const rs = this.getResourceById(ev.requestId);
        if (rs) {
            rs.status = 'loadingFinished';
        }
    }

    private onLoadingFailed(ev: CdpLoadingFailed) {
        this.lastNetworkEventAt = Date.now();
        this.pendingRequestIds.delete(ev.requestId);
        const rs = this.getResourceById(ev.requestId);
        if (rs) {
            rs.status = 'loadingFailed';
            rs.errorText = ev.errorText;
            this.logFailedRequest(rs);
        }
    }

    private logFailedRequest(rs: NetworkResource) {
        // Do not log ERR_ABORTED
        const looksLikeAborted = !rs.errorText || rs.errorText === 'net::ERR_ABORTED';
        if (looksLikeAborted && rs.type !== 'Document') {
            return;
        }
        if (IGNORE_REQUEST_LOG_TYPES.includes(rs.type)) {
            return;
        }
        this.logger.debug('Request failed to load', {
            details: rs,
        });
    }

    private logHttpError(rs: NetworkResource) {
        if (IGNORE_REQUEST_LOG_TYPES.includes(rs.type)) {
            return;
        }
        this.logger.debug('Request failed with HTTP error', {
            details: rs,
        });
    }

    /**
     * @deprecated
     */
    static headersObjectToEntries(cdpHeaders: CdpHeaders): CdpHeaderEntry[] {
        return convertHeadersToEntries(cdpHeaders);
    }

    /**
     * @deprecated
     */
    static headerEntriesToObject(cdpHeaderEntries: CdpHeaderEntry[]): CdpHeaders {
        return convertHeadersToObject(cdpHeaderEntries);
    }

}

export interface NetworkResource {
    requestId: string;
    frameId: string;
    type: string;
    status: 'requestWillBeSent' | 'responseReceived' | 'loadingFinished' | 'loadingFailed';
    localSendTimestamp: number;
    request: CdpRequest;
    response?: CdpResponse;
    errorText?: string;
}
