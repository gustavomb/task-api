/* eslint camelcase: 0 */

exports.toModel = function toModel(task) {
    const {
        due_date,
        requester,
        owners,
        children,
        ...oldTask
    } = task;

    return {
        dueDate: due_date,
        requesterId: requester,
        owners: owners.map((o) => ({ ownerId: o })),
        children: children ? children.map((c) => toModel(c)) : undefined,
        ...oldTask,
    };
};

exports.toJson = (model) => ({
    id: model.id,
    title: model.title,
    description: model.description,
    status: model.status,
    due_date: model.dueDate,
    requester: model.requesterId,
    owners: model.owners ? model.owners.map((o) => o.ownerId) : undefined,
    parent: model.parent ? { id: model.parent.id, title: model.parent.title } : undefined,
    children: model.children && model.children.length > 0 ? model.children.map((c) => ({
        id: c.id,
        title: c.title,
    })) : undefined,
});
