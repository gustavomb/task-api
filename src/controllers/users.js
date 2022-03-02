const userService = require('services/users');

exports.createUser = async (ctx) => {
    const { name } = ctx.request.body;
    const newUser = await userService.createUser(name);
    ctx.status = 201;
    ctx.body = {
        id: newUser.id,
        name: newUser.name,
    };
};
