const { PrismaClient, TaskStatus } = require('@prisma/client');
const { DomainError } = require('errors');

const prisma = new PrismaClient();

exports.getTask = async (taskId) => (
    prisma.task.findUnique({
        where: { id: taskId },
        include: {
            parent: {
                select: {
                    id: true,
                    title: true,
                },
            },
            children: {
                select: {
                    id: true,
                    title: true,
                },
            },
            owners: {
                select: {
                    ownerId: true,
                },
            },
        },
    })
);

exports.getTasks = async (limit) => (
    prisma.task.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            dueDate: true,
            requester: true,
            owners: true,
        },
        orderBy: [
            {
                dueDate: 'desc',
            },
        ],
        take: limit,
    })
);

exports.createTask = async (task) => {
    const hasChildren = Array.isArray(task.children) && task.children.length > 0;
    if (hasChildren) {
        const parentMatchChildDate = task.children
            .filter((c) => c.due_date === task.due_date).length > 0;
        const parentHasHighestDate = task.children
            .filter((c) => c.due_date > task.due_date).length > 0;

        if (!parentMatchChildDate || parentHasHighestDate) {
            throw new DomainError('The due date of parent task must match the highest due date among their children');
        }

        const hasTodoChildren = task.children
            .filter((c) => c.status === TaskStatus.to_do).length > 0;
        const hasDoingChildren = task.children
            .filter((c) => c.status === TaskStatus.doing).length > 0;
        const hasDoneChildren = task.children
            .filter((c) => c.status === TaskStatus.done).length > 0;

        if (hasDoingChildren) {
            throw new DomainError('Children task status can be either to_do or doing');
        }

        const hasParentInvalidStatus = (task.status === TaskStatus.done && hasTodoChildren)
                || (task.status === TaskStatus.to_do && hasDoneChildren)
                || (task.status !== TaskStatus.doing && hasTodoChildren && hasDoneChildren);

        if (hasParentInvalidStatus) {
            throw new DomainError('A parent tasks with to_do or done status must match all it\'s children status, otherwise it must be doing');
        }
    }

    const newTask = await prisma.task.create({
        data: {
            ...task,
            owners: {
                create: task.owners.map((o) => ({
                    owner: {
                        connect: {
                            id: o.ownerId,
                        },
                    },
                })),
            },
            children: task.children ? {
                create: task.children.map((c) => ({
                    ...c,
                    owners: {
                        create: c.owners.map((o) => ({
                            owner: {
                                connect: {
                                    id: o.ownerId,
                                },
                            },
                        })),
                    },
                })),
            } : undefined,
        },
    });

    return prisma.task.findUnique({
        where: { id: newTask.id },
        include: {
            parent: true,
            children: true,
            owners: true,
        },
    });
};

async function taskHasChildren(t) {
    if (t.parentId) return false;

    const count = await prisma.task.groupBy({
        by: ['parentId'],
        where: { parentId: t.id },
        _count: {
            id: true,
        },
    });
    return count[0]._count.id > 0;
}

async function updateTask(t, status, client = prisma) {
    return client.task.update({
        where: { id: t.id },
        data: {
            status,
        },
    });
}

async function updateStatusByChildrenStatus(t, client = prisma) {
    if (t.parentId === undefined || t.parentId === null) {
        return;
    }

    const parent = await client.task.findUnique({
        where: { id: t.parentId },
        include: { children: true },
    });

    let { status } = parent;
    const tasksDone = parent.children.filter((child) => child.status === TaskStatus.done);

    if (tasksDone.length === parent.children.length) {
        status = TaskStatus.done;
    } else if (tasksDone.length > 0) {
        status = TaskStatus.doing;
    }

    if (parent.status !== status) {
        await updateTask(parent, status, client);
    }
}

exports.changeTaskStatus = async (taskId, status) => {
    const t = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
            id: true,
            status: true,
            parentId: true,
        },
    });

    // nothing to do
    if (t.status === status) {
        return;
    }

    const hasParent = t.parentId !== null;

    if (await taskHasChildren(t)) {
        throw new DomainError('Cannot change the status, either some children tasks are pending or all children tasks are done');
    } else if (hasParent && status === TaskStatus.doing) {
        throw new DomainError('Child tasks can be either done or doing');
    }

    await prisma.$transaction(async (client) => {
        await updateTask(t, status, client);
        await updateStatusByChildrenStatus(t, client);
    });
};
