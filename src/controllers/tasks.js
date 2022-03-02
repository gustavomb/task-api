const taskService = require('services/tasks');
const taskMapper = require('mappers/task');

exports.createTask = async (ctx) => {
    const task = taskMapper.toModel(ctx.request.body);
    const newTask = await taskService.createTask(task);
    ctx.status = 201;
    ctx.body = taskMapper.toJson(newTask);
};

exports.getTask = async (ctx) => {
    const { id } = ctx.params;
    const task = await taskService.getTask(id);
    if (task) ctx.body = taskMapper.toJson(task);
};

exports.getTasks = async (ctx) => {
    const { limit } = ctx.query;
    const tasks = await taskService.getTasks(limit);
    ctx.body = tasks.map((t) => taskMapper.toJson(t));
};

exports.updateStatus = async (ctx) => {
    const { id } = ctx.params;
    const { status } = ctx.request.body;
    await taskService.changeTaskStatus(id, status);
    ctx.status = 204;
};
