const taskService = require('services/tasks');
const taskMapper = require('mappers/task');

exports.createTask = async (ctx) => {
    const task = taskMapper.toModel(ctx.request.body);
    const newTask = await taskService.createTask(task);
    ctx.status = 201;
    ctx.body = taskMapper.toJson(newTask);
};
