import fs from 'fs';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router2';
import serveStatic from 'koa-static';
import path from 'path';
import querystring from 'querystring';
import rimraf from 'rimraf';
import URL from 'url';

const uploadsDir = path.resolve(process.cwd(), '.tmp/uploads');

rimraf.sync(uploadsDir);
fs.mkdirSync(uploadsDir, { recursive: true });

export const server = new Koa();
export const router = new Router();

export async function startServer() {
    return new Promise<void>(resolve => {
        server.listen(3007, () => resolve())
            .on('error', err => {
                // eslint-disable-next-line no-console
                console.warn(err.message);
                resolve();
            });
    });
}

server.use(
    bodyParser({
        jsonLimit: '20mb',
    }),
);

server.use(async (ctx, next) => {
    const delay = Number(ctx.query.delay);
    const status = Number(ctx.query.status);
    if (delay) {
        await new Promise(r => setTimeout(r, delay));
    }
    if (status) {
        ctx.status = status;
    }
    if (ctx.query.download) {
        ctx.response.attachment(ctx.query.download as string);
    }
    await next();
});

router.post('/html', async ctx => {
    const items = [];
    for (const [k, v] of Object.entries(ctx.request.body || {})) {
        items.push(`<li><span>${k}</span>: <strong>${v}</strong></li>`);
    }
    ctx.body = `<ul>${items.join('')}</ul>`;
});

router.get('/headers', async ctx => {
    ctx.body = ctx.request.headers;
});

router.post('/echo', async ctx => {
    ctx.body = ctx.request.body;
});

router.post('/redirect', async ctx => {
    const { query } = ctx;
    const { body } = ctx.request;
    const params = Object.assign({}, body, query);
    const { to } = params;
    delete params.to;
    const parsed = URL.parse(to as any);
    const qs = querystring.parse(parsed.query as string);
    Object.assign(qs, params);
    parsed.search = '?' + querystring.stringify(qs);
    ctx.redirect(URL.format(parsed));
});

router.get('/error/:status', async ctx => {
    ctx.throw(Number((ctx as any).params.status));
});

server.use(router.routes());
server.use(serveStatic(`${process.cwd()}/src/test/assets`));
