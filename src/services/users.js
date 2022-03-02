const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.createUser = async (name) => (
    prisma.user.create({
        data: {
            name,
        },
    })
);
