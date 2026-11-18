# DevPulse

Requires Node 22.13+ and pnpm (`corepack enable` picks up the pinned version).

Collects data about your projects (GitHub pull requests for now) into SQLite, with tracing built in. Built with Effect v4.

    pnpm install
    pnpm collect owner/repo [owner/repo ...]
    pnpm verify

Runs automatically every 6 hours in GitHub Actions (`.github/workflows/collect.yml`) and saves data to `data/devpulse.db`.

Environment variables: `GITHUB_TOKEN`, `DEVPULSE_REPOS` (comma-separated), `DEVPULSE_OWNERS` (comma-separated, all their repos), `DEVPULSE_DB` (default `devpulse.db`), `OTEL_EXPORTER_OTLP_ENDPOINT`.

Progress notes: [progress/](progress/README.md)
