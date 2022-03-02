const JoiRouter = require('koa-joi-router');
const userController = require('controllers/users');

const { Joi } = JoiRouter;

const router = new JoiRouter();

router.route({
    method: 'post',
    path: '/',
    validate: {
        type: 'json',
        body: {
            name: Joi.string().required(),
        },
    },
    handler: userController.createUser,
});

module.exports = router.middleware();
