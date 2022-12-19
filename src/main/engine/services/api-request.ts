import { OAuth2Agent, Request, RequestOptions } from '@ubio/request';
import { inject, injectable } from 'inversify';

import { Configuration, stringConfig } from '../../config.js';

const AC_API_URL = stringConfig('AC_API_URL', 'https://api.automationcloud.net');
const AC_API_TOKEN_URL = stringConfig('AC_API_TOKEN_URL', '');
const AC_API_CLIENT_ID = stringConfig('AC_API_CLIENT_ID', '');
const AC_API_CLIENT_KEY = stringConfig('AC_API_CLIENT_KEY', '');
const AC_API_REFRESH_TOKEN = stringConfig('AC_API_REFRESH_TOKEN', '');

@injectable()
export class ApiRequest {
    authAgent!: OAuth2Agent;
    request!: Request;

    constructor(
        @inject(Configuration)
        protected config: Configuration,
    ) {
        this.setup();
    }

    setup() {
        const refreshToken = this.config.get(AC_API_REFRESH_TOKEN) || undefined;
        this.authAgent = new OAuth2Agent({
            tokenUrl: this.config.get(AC_API_TOKEN_URL),
            clientId: this.config.get(AC_API_CLIENT_ID),
            clientSecret: this.config.get(AC_API_CLIENT_KEY),
            refreshToken,
        });
        this.request = new Request({
            baseUrl: this.config.get(AC_API_URL),
            auth: this.authAgent,
        });
    }

    get(url: string, options: RequestOptions = {}) {
        return this.request.get(url, options);
    }

    post(url: string, options: RequestOptions = {}) {
        return this.request.post(url, options);
    }

    put(url: string, options: RequestOptions = {}) {
        return this.request.put(url, options);
    }

    delete(url: string, options: RequestOptions = {}) {
        return this.request.delete(url, options);
    }

}
