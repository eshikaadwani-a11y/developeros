/**
 * `task` command - a minimal task manager persisted to JSON.
 *
 * Subcommands:
 *   task add <title...>   Add a new task
 *   task list [--all]     List pending tasks (or all with --all)
 *   task done <id>        Mark a task as complete
 *   task rm <id>          Remove a task
 */

import { JsonStore } from "../store/jsonStore";
import type { Command, CommandContext, CommandResult } from "../core/types";

export interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

interface TaskFile {
  nextId: number;
  tasks: Task[];
}

const EMPTY: TaskFile = { nextId: 1, tasks: [] };

function store(): JsonStore<TaskFile> {
  return new JsonStore<TaskFile>("tasks.json", EMPTY);
}

function parseId(raw: string | undefined): number | null {
  if (raw === undefined) {
    return null;
  }
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function addTask(ctx: CommandContext): Promise<CommandResult> {
  const title = ctx.args.slice(1).join(" ").trim();
  if (!title) {
    ctx.logger.error("a task title is required: task add <title>");
    return { exitCode: 1 };
  }
  const file = await store().update((cur) => {
    const task: Task = {
      id: cur.nextId,
      title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    return { nextId: cur.nextId + 1, tasks: [...cur.tasks, task] };
  });
  const added = file.tasks[file.tasks.length - 1];
  ctx.logger.success(`added task #${added.id}: ${added.title}`);
  return { exitCode: 0 };
}

function listTasks(ctx: CommandContext, file: TaskFile): CommandResult {
  const showAll = Boolean(ctx.flags.all);
  const tasks = showAll ? file.tasks : file.tasks.filter((t) => !t.done);

  if (ctx.flags.json) {
    ctx.logger.info(JSON.stringify(tasks, null, 2));
    return { exitCode: 0 };
  }

  if (tasks.length === 0) {
    ctx.logger.dim(showAll ? "no tasks" : "no pending tasks");
    return { exitCode: 0 };
  }

  for (const t of tasks) {
    const mark = t.done ? ctx.logger.color("[x]", "green") : "[ ]";
    ctx.logger.info(`  ${mark} #${t.id} ${t.title}`);
  }
  return { exitCode: 0 };
}

async function completeTask(ctx: CommandContext): Promise<CommandResult> {
  const id = parseId(ctx.args[1]);
  if (id === null) {
    ctx.logger.error("a valid task id is required: task done <id>");
    return { exitCode: 1 };
  }
  let found = false;
  await store().update((cur) => {
    const tasks = cur.tasks.map((t) => {
      if (t.id === id) {
        found = true;
        return { ...t, done: true };
      }
      return t;
    });
    return { ...cur, tasks };
  });
  if (!found) {
    ctx.logger.error(`no task with id #${id}`);
    return { exitCode: 1 };
  }
  ctx.logger.success(`completed task #${id}`);
  return { exitCode: 0 };
}

async function removeTask(ctx: CommandContext): Promise<CommandResult> {
  const id = parseId(ctx.args[1]);
  if (id === null) {
    ctx.logger.error("a valid task id is required: task rm <id>");
    return { exitCode: 1 };
  }
  let found = false;
  await store().update((cur) => {
    const tasks = cur.tasks.filter((t) => {
      if (t.id === id) {
        found = true;
        return false;
      }
      return true;
    });
    return { ...cur, tasks };
  });
  if (!found) {
    ctx.logger.error(`no task with id #${id}`);
    return { exitCode: 1 };
  }
  ctx.logger.success(`removed task #${id}`);
  return { exitCode: 0 };
}

export const taskCommand: Command = {
  name: "task",
  description: "Manage your task list (add, list, done, rm)",
  usage: "task <add|list|done|rm> [args]",
  async run(ctx: CommandContext): Promise<CommandResult> {
    const sub = ctx.args[0];
    switch (sub) {
      case "add":
        return addTask(ctx);
      case "list":
      case undefined:
        return listTasks(ctx, await store().read());
      case "done":
        return completeTask(ctx);
      case "rm":
        return removeTask(ctx);
      default:
        ctx.logger.error(`unknown subcommand: task ${sub}`);
        ctx.logger.info("Use: task <add|list|done|rm>");
        return { exitCode: 1 };
    }
  },
};
