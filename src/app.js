const Koa = require('koa');
const morgan = require('koa-morgan');
const router = require('routes');

const app = new Koa();

app.use(morgan('dev'));
app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
