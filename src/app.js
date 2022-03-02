const Koa = require('koa');
const morgan = require('koa-morgan');
const router = require('routes');
const { DomainError } = require('./errors');

const app = new Koa();

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (err instanceof DomainError) {
            err.status = 422;
            ctx.status = err.status;
            ctx.body = err.message;
        } else {
            throw err;
        }
    }
});

app.use(morgan('combined'));
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
