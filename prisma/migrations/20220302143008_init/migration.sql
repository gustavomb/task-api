-- AddExtension
DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION "uuid-ossp" SCHEMA public;

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('to_do', 'doing', 'done');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1mc(),
    "name" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v1mc(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "task_status" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "requester_id" UUID NOT NULL,
    "parent_id" UUID,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_owners" (
    "taskId" UUID NOT NULL,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "task_owners_pkey" PRIMARY KEY ("taskId","ownerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date" DESC);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_owners" ADD CONSTRAINT "task_owners_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_owners" ADD CONSTRAINT "task_owners_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
