# Step 1b — Scheduled collection in GitHub Actions

**Date:** 2026-11-18

## Built
- `.github/workflows/collect.yml` — runs every 6 hours (at :17) and on demand ("Run workflow" button): install → test → collect → commit `data/devpulse.db` back to `main`.
- Tracks `Effect-TS/effect` (`DEVPULSE_REPOS`) plus every repo owned by `ydunets` (`DEVPULSE_OWNERS`), excluding forks and archived repos. New repos are picked up automatically.
- `src/collector/Targets.ts` — merges explicit repos with discovered ones, removes duplicates (case-insensitive). A failed owner lookup fails the run so it shows up red in Actions.
- `GitHub.ownedRepositories(owner)` — lists an owner's public repos.
- Uses the workflow's built-in token. Optional repo secret `DEVPULSE_GITHUB_TOKEN` (a personal access token) overrides it.

## Verified
- `pnpm typecheck` passes, `pnpm test` 10/10.
- Workflow YAML parses. First real run happens on GitHub after push.

## Known limits
- Owner discovery lists public repos only. Private repos (`ydunets/nodejs`, `ydunets/flowers-store`) need `DEVPULSE_GITHUB_TOKEN` and must be added to `DEVPULSE_REPOS`.
- Only the 50 most recently updated pull requests per repo are fetched each run.
- The SQLite file is committed on each run that changes data, so repo size grows slowly over time.
