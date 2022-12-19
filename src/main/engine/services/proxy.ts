import { ProxyUpstream, RoutingProxy } from '@ubio/uniproxy';
import { readFileSync } from 'fs';
import { inject, injectable } from 'inversify';
import path from 'path';

import { Configuration, numberConfig, stringConfig } from '../../config.js';
import { Logger } from '../../logger.js';
import { SessionHandler } from '../session.js';

const PROXY_PORT = numberConfig('PROXY_PORT', 3128);
const CA_CERTIFICATES = stringConfig('CA_CERTIFICATES', '');
const caCert = readFileSync(path.join(__dirname, '../../../ca.crt'), 'utf-8');

@injectable()
@SessionHandler()
export class ProxyService extends RoutingProxy {

    constructor(
        @inject(Configuration)
        protected config: Configuration,
        @inject(Logger)
        logger: Logger,
    ) {
        super({
            logger,
        });
    }

    override getCACertificates() {
        const defaults = super.getCACertificates();
        const ca = this.config.get(CA_CERTIFICATES);
        return [...defaults, ca, caCert].filter(Boolean);
    }

    async onSessionStart() {
        await this.init();
    }

    async onSessionFinish() {
        await this.shutdown(true);
    }

    getProxyPort() {
        return this.config.get(PROXY_PORT);
    }

    setup(proxyUpstream: ProxyUpstream) {
        this.clearRoutes();
        this.defaultUpstream = proxyUpstream;
        this.insertRoute({
            label: 'bypass-chrome-internals',
            hostPattern: '(\\.google\\.com|\\.gvt1\\.com|update\\.googleapis\\.com)(:443)?$',
            upstream: null,
        });
    }

    /**
     * Kept for backwards compatibility with scripts.
     *
     * @deprecated Use `insertRoute` instead.
     * @internal
     */
    addRoute(hostRegexp: RegExp, upstream: ProxyUpstream | null, label: string = 'default') {
        this.insertRoute({
            hostPattern: hostRegexp.source,
            upstream,
            label,
        }, 0);
    }

    async init() {
        if (this.isRunning()) {
            return;
        }
        const port = this.getProxyPort();
        try {
            await this.start(port);
            this.logger.info(`Local proxy listening on ${port}`);
        } catch (err: any) {
            if (err.code === 'EADDRINUSE') {
                this.logger.warn(`Local proxy port is busy`, { err, port });
                return;
            }
            throw err;
        }
    }

}
