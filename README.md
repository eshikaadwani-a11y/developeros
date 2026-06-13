# DeveloperOS

Your developer command center — a small, dependency-free CLI for everyday
developer chores: inspect your environment, track tasks, and jot quick notes.

DeveloperOS is written in TypeScript and ships with **zero runtime
dependencies** (it uses only Node.js built-ins).

## Requirements

- Node.js >= 18

## Install & build

```bash
npm install        # installs dev dependencies (TypeScript)
npm run build      # compiles src/ to dist/
npm link           # optional: makes the `dev` command available globally
```

If you don't link it globally, run the compiled entry point directly:

```bash
node dist/index.js <command> [options]
```

## Usage

```text
dev <command> [options]

Commands:
  note    Capture quick, timestamped notes (add, list, rm, clear)
  status  Show a snapshot of the current developer environment
  task    Manage your task list (add, list, done, rm)

Global options:
  --help, -h     Show help
  --version, -v  Show version
```

### `status`

Prints runtime, OS, CPU/memory, working directory, and the current git branch.

```bash
dev status
dev status --json     # machine-readable output
```

### `task`

A minimal task tracker.

```bash
dev task add "Write the docs"
dev task list           # pending tasks
dev task list --all     # include completed tasks
dev task done 1         # mark task #1 complete
dev task rm 1           # delete task #1
dev task list --json    # machine-readable output
```

### `note`

Capture quick, timestamped notes.

```bash
dev note add "Investigate the flaky test"
dev note list           # newest first
dev note rm 2           # delete note #2
dev note clear          # remove all notes
dev note list --json    # machine-readable output
```

## Data & configuration

State is stored as JSON under `~/.developeros/` (`tasks.json`, `notes.json`).
Override the location with the `DEVELOPEROS_HOME` environment variable — handy
for testing or keeping project-scoped state:

```bash
DEVELOPEROS_HOME=./.devos dev task add "scoped to this project"
```

Color output follows the [NO_COLOR](https://no-color.org/) convention and is
disabled automatically when output is not a TTY.

## Project layout

```
src/
  cli/        # argument parser, command registry, app runner
  commands/   # status, task, note
  core/       # logger, shared types, metadata
  store/      # JSON-file-backed persistence
  index.ts    # entry point
test/         # node:test suites
types/        # ambient Node type shims (offline-friendly)
```

## Development

```bash
npm run typecheck   # type-check without emitting
npm run build       # compile to dist/
npm test            # build + run the node:test suites
npm run clean       # remove dist/
```

## License

MIT
