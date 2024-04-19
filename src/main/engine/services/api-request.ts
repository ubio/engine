import { AuthAgent, OAuth2Agent, Request, RequestOptions } from '@ubio/request';
import { inject, injectable } from 'inversify';

import { Configuration, stringConfig } from '../../config.js';

const AC_API_URL = stringConfig('AC_API_URL', 'https://api.automationcloud.net');
const AC_API_TOKEN_URL = stringConfig('AC_API_TOKEN_URL', '');
const AC_API_CLIENT_ID = stringConfig('AC_API_CLIENT_ID', '');
const AC_API_CLIENT_KEY = stringConfig('AC_API_CLIENT_KEY', '');

@injectable()
export class ApiRequest {
    protected request: Request | null = null;

    constructor(
        @inject(Configuration)
        protected config: Configuration,
    ) {}

    getRequest() {
        if (this.request == null) {
            this.request = this.createRequest();
        }
        return this.request;
    }

    createAuthAgent(): AuthAgent {
        return new OAuth2Agent({
            tokenUrl: this.config.get(AC_API_TOKEN_URL),
            clientId: this.config.get(AC_API_CLIENT_ID),
            clientSecret: this.config.get(AC_API_CLIENT_KEY),
        });
    }

    createRequest() {
        return new Request({
            baseUrl: this.config.get(AC_API_URL),
            auth: this.createAuthAgent(),
        });
    }

    get(url: string, options: RequestOptions = {}) {
        return this.getRequest().get(url, options);
    }

    post(url: string, options: RequestOptions = {}) {
        return this.getRequest().post(url, options);
    }

    put(url: string, options: RequestOptions = {}) {
        return this.getRequest().put(url, options);
    }

    delete(url: string, options: RequestOptions = {}) {
        return this.getRequest().delete(url, options);
    }

    send(method: string, url: string, options: RequestOptions = {}) {
        return this.getRequest().send(method, url, options);
    }

    getBlob(url: string, contentType: string, options: RequestOptions = {}) {
        return this.getRequest().getBlob(url, contentType, options);
    }
}
