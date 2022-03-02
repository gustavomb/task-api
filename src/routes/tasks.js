const JoiRouter = require('koa-joi-router');
const taskController = require('controllers/tasks');

const { Joi } = JoiRouter;

const taskStatusValues = Joi.string().valid('to_do', 'doing', 'done');

const taskSchema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string(),
    status: taskStatusValues.required(),
    requester: Joi.string().uuid().required(),
    owners: Joi.array().items(Joi.string().uuid()).required(),
    due_date: Joi.date().required(),
});

const tasksWithChildrenSchema = taskSchema.concat(
    Joi.object().keys({
        children: Joi.array().items(taskSchema),
    }),
);

const router = new JoiRouter();

router.route({
    method: 'post',
    path: '/',
    validate: {
        type: 'json',
        body: tasksWithChildrenSchema,
    },
    handler: taskController.createTask,
});

router.route({
    method: 'get',
    path: '/:id',
    validate: {
        params: {
            id: Joi.string().uuid(),
        },
    },
    handler: taskController.getTask,
});

router.route({
    method: 'get',
    path: '/',
    validate: {
        query: {
            limit: Joi.number().integer(),
        },
    },
    handler: taskController.getTasks,
});

router.route({
    method: 'put',
    path: '/:id/status',
    validate: {
        params: {
            id: Joi.string().uuid(),
        },
        type: 'json',
        body: {
            status: taskStatusValues,
        },
    },
    handler: taskController.updateStatus,
});

module.exports = router.middleware();
