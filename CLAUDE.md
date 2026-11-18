# DevPulse

Collects data about GitHub projects into SQLite on a schedule, with tracing built in. An AI agent will answer questions about that data.

## Stack
Effect v4 (4.1.x), @effect/sql-sqlite-node, TypeScript strict, Vitest + @effect/vitest, pnpm 12, Node 24 in CI.

## Commands
- `pnpm verify` — typecheck + project rules + tests with 80% coverage. Run before every commit.
- `pnpm test` — tests only.
- `pnpm collect owner/repo ...` — run the collector.
- `pnpm collect:cloud owner/repo ...` — run it inside a Claude cloud session.

## Layout
Feature folders, one responsibility per file:
- `src/github/` — GitHub API client and its raw schemas. GitHub JSON never leaves this folder.
- `src/pull-requests/` — `PullRequest` model and `PullRequestStore`.
- `src/collector/` — `Collector`, run log, target resolution.
- `src/database/` — SQLite client and numbered migrations.
- `src/tracing/` — OTLP or console tracer.
- `src/AppLayer.ts` wires layers, `src/main.ts` is the entry point.
- `test/support/` — fakes (`FakeGitHub`, `FakeHttpClient`) and fixtures.
- `progress/` — one note per step; update `progress/README.md` when a step finishes.

## Workflow
1. Plan non-trivial work first (`/plan`).
2. Write the failing test, then the code (`/tdd`).
3. `pnpm verify` must pass.
4. Review the diff (`code-reviewer` agent).
5. Conventional commit (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`), then `/checkpoint`.

Detailed rules live in `.claude/rules/`.
