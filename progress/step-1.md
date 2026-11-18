# Step 1 — Collector, database, tracing

**Date:** 2026-11-18
**Stack:** pnpm 12.21.0, Effect 4.1.4, @effect/sql-sqlite-node 4.1.4 (node:sqlite), Node 22, TypeScript strict, Vitest

## Built
- `src/github/` — `GitHub` service: fetches PRs from api.github.com, retries transient errors, validates the response with Schema, maps it to the domain `PullRequest`. Typed `GitHubError` reasons: NotFound, Unauthorized, Forbidden, RateLimited, Network, BadResponse.
- `src/pull-requests/` — `PullRequest` model and `PullRequestStore` (upsert by repo + number, find by repo).
- `src/collector/` — `Collector` service: collects repos concurrently (max 4), one failure never stops the others, every attempt is saved in `collector_runs`.
- `src/database/` — SQLite client + numbered migrations.
- `src/tracing/` — tracing always on: OTLP export when `OTEL_EXPORTER_OTLP_ENDPOINT` is set, otherwise a span tree printed to the console.
- `src/AppLayer.ts` — wires layers; `src/main.ts` — CLI entry point.

## Design rules
- One responsibility per file, every file under 300 lines (largest ~65), no comments.
- Services depend on interfaces (`Context.Service`), not implementations; tests swap in fakes.
- GitHub's raw JSON shape never leaves `src/github/`.

## Verified
- `pnpm typecheck` — passes.
- `pnpm test` — 8/8 pass (GitHub mapping and errors, collector success/partial failure/invalid slug, upsert without duplicates, console tracer).
- End-to-end CLI run against a real SQLite file — migrations, run records and trace output all work.

## Running in the Claude cloud session
- `pnpm collect:cloud owner/repo` — routes Node's fetch through the session proxy (`NODE_USE_ENV_PROXY=1`) and drops the sandbox's own `GITHUB_TOKEN`, which GitHub rejects.
- Verified live: `ydunets/dev-pulse` → 200, 0 pull requests stored.
- Only repos attached to the session (Claude GitHub App installed) are readable through the GitHub API here. Other repos return 403, reported as `Forbidden`.

## Run
    pnpm install
    pnpm collect:cloud ydunets/dev-pulse      # inside a Claude cloud session
    pnpm collect Effect-TS/effect facebook/react
    GITHUB_TOKEN=... pnpm collect          # higher rate limit
    OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 pnpm collect   # send traces to Jaeger
