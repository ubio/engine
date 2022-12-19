import { CdpHeaders } from '../cdp/index.js';

export interface RequestSpec {
    method: string;
    url: string;
    headers: CdpHeaders;
    body: string | null;
}

export interface ResponseSpec {
    url: string;
    status: number;
    statusText: string;
    headers: CdpHeaders;
    body: any | null;
}

export interface NetworkResult {
    requestId?: string;
    request: RequestSpec;
    response: ResponseSpec;
}
