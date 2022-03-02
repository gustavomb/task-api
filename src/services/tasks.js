const { PrismaClient, TaskStatus } = require('@prisma/client');

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
            throw new Error('The due date of parent task must match the highest due date among their children');
        }

        const hasTodoChildren = task.children
            .filter((c) => c.status === TaskStatus.to_do).length > 0;
        const hasDoingChildren = task.children
            .filter((c) => c.status === TaskStatus.doing).length > 0;
        const hasDoneChildren = task.children
            .filter((c) => c.status === TaskStatus.done).length > 0;

        if (hasDoingChildren) {
            throw new Error('children task status can be either to_do or doing');
        }

        const hasParentInvalidStatus = (task.status === TaskStatus.done && hasTodoChildren)
                || (task.status === TaskStatus.to_do && hasDoneChildren)
                || (task.status !== TaskStatus.doing && hasTodoChildren && hasDoneChildren);

        if (hasParentInvalidStatus) {
            throw new Error('a parent tasks with to_do or done status must match all its children status, otherwise it must be doing');
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
