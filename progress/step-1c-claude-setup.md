# Step 1c — Claude Code setup (techniques from everything-claude-code)

**Date:** 2026-11-18
**Source:** `ydunets/everything-claude-code` — adopted selectively and adapted to Effect v4 and this project's rules.

## Adopted
- `CLAUDE.md` — stack, commands, layout, workflow (plan → test first → verify → review → conventional commit → checkpoint).
- `.claude/rules/` — `code-style.md`, `effect.md`, `testing.md`, `git.md`.
- Verification loop — `pnpm verify` = typecheck + `pnpm rules` + tests with 80% coverage thresholds. CI runs it before collecting.
- `scripts/check-rules.ts` — enforces ≤ 300 lines per file, no comments, no `console.*` outside allowed files.
- Hook — `.claude/settings.json` runs typecheck + rules after every `.ts` edit; failures are sent back to Claude (exit 2).
- Agents — `code-reviewer`, `tdd-guide`, `planner` in `.claude/agents/`.
- Commands — `/verify`, `/tdd`, `/plan`, `/checkpoint` in `.claude/commands/`.

## Skipped
- tmux hooks (not useful in cloud sessions), "block .md files" hook (conflicts with `progress/`), Prettier hook (no formatter configured), memory-persistence and continuous-learning hooks (`progress/` plays that role).

## Verified
- `pnpm verify` passes: 13 tests, coverage 98% lines / 90% branches.
- Hook tested: exit 0 on a clean file, exit 2 with the violation listed after adding a comment.
