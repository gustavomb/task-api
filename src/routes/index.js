const JoiRouter = require('koa-joi-router');
const tasks = require('./tasks');
const users = require('./users');

const router = new JoiRouter();
router.use('/tasks', tasks);
router.use('/users', users);

module.exports = router.router;
