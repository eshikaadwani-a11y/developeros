/**
 * `note` command - capture quick, timestamped notes persisted to JSON.
 *
 * Subcommands:
 *   note add <text...>   Save a new note
 *   note list [--json]   List saved notes (newest first)
 *   note rm <id>         Delete a note
 *   note clear           Remove all notes
 */

import { JsonStore } from "../store/jsonStore";
import type { Command, CommandContext, CommandResult } from "../core/types";

export interface Note {
  id: number;
  text: string;
  createdAt: string;
}

interface NoteFile {
  nextId: number;
  notes: Note[];
}

const EMPTY: NoteFile = { nextId: 1, notes: [] };

function store(): JsonStore<NoteFile> {
  return new JsonStore<NoteFile>("notes.json", EMPTY);
}

function parseId(raw: string | undefined): number | null {
  if (raw === undefined) {
    return null;
  }
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function formatDate(iso: string): string {
  // Trim to "YYYY-MM-DD HH:MM" for compact display.
  return iso.replace("T", " ").slice(0, 16);
}

async function addNote(ctx: CommandContext): Promise<CommandResult> {
  const text = ctx.args.slice(1).join(" ").trim();
  if (!text) {
    ctx.logger.error("note text is required: note add <text>");
    return { exitCode: 1 };
  }
  const file = await store().update((cur) => {
    const note: Note = {
      id: cur.nextId,
      text,
      createdAt: new Date().toISOString(),
    };
    return { nextId: cur.nextId + 1, notes: [...cur.notes, note] };
  });
  const added = file.notes[file.notes.length - 1];
  ctx.logger.success(`saved note #${added.id}`);
  return { exitCode: 0 };
}

function listNotes(ctx: CommandContext, file: NoteFile): CommandResult {
  // Newest first.
  const notes = [...file.notes].sort((a, b) => b.id - a.id);

  if (ctx.flags.json) {
    ctx.logger.info(JSON.stringify(notes, null, 2));
    return { exitCode: 0 };
  }

  if (notes.length === 0) {
    ctx.logger.dim("no notes");
    return { exitCode: 0 };
  }

  for (const n of notes) {
    const stamp = ctx.logger.color(formatDate(n.createdAt), "gray");
    ctx.logger.info(`  #${n.id} ${stamp}  ${n.text}`);
  }
  return { exitCode: 0 };
}

async function removeNote(ctx: CommandContext): Promise<CommandResult> {
  const id = parseId(ctx.args[1]);
  if (id === null) {
    ctx.logger.error("a valid note id is required: note rm <id>");
    return { exitCode: 1 };
  }
  let found = false;
  await store().update((cur) => {
    const notes = cur.notes.filter((n) => {
      if (n.id === id) {
        found = true;
        return false;
      }
      return true;
    });
    return { ...cur, notes };
  });
  if (!found) {
    ctx.logger.error(`no note with id #${id}`);
    return { exitCode: 1 };
  }
  ctx.logger.success(`removed note #${id}`);
  return { exitCode: 0 };
}

async function clearNotes(ctx: CommandContext): Promise<CommandResult> {
  await store().write({ nextId: 1, notes: [] });
  ctx.logger.success("cleared all notes");
  return { exitCode: 0 };
}

export const noteCommand: Command = {
  name: "note",
  description: "Capture quick, timestamped notes (add, list, rm, clear)",
  usage: "note <add|list|rm|clear> [args]",
  async run(ctx: CommandContext): Promise<CommandResult> {
    const sub = ctx.args[0];
    switch (sub) {
      case "add":
        return addNote(ctx);
      case "list":
      case undefined:
        return listNotes(ctx, await store().read());
      case "rm":
        return removeNote(ctx);
      case "clear":
        return clearNotes(ctx);
      default:
        ctx.logger.error(`unknown subcommand: note ${sub}`);
        ctx.logger.info("Use: note <add|list|rm|clear>");
        return { exitCode: 1 };
    }
  },
};
