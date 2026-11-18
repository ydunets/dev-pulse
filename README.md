# DevPulse

Collects data about your projects (GitHub pull requests for now) into SQLite, with tracing built in. Built with Effect v4.

    npm install
    npm run collect -- owner/repo [owner/repo ...]
    npm test

Environment variables: `GITHUB_TOKEN`, `DEVPULSE_REPOS` (comma-separated), `DEVPULSE_DB` (default `devpulse.db`), `OTEL_EXPORTER_OTLP_ENDPOINT`.

Progress notes: [progress/](progress/README.md)
