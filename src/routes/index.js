const JoiRouter = require('koa-joi-router');
const tasks = require('./tasks');

const router = new JoiRouter();
router.use('/tasks', tasks);

module.exports = router.router;
