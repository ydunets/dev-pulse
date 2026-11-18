# Git

- Conventional commits: `<type>: <description>`; types feat, fix, refactor, test, docs, chore, perf, ci.
- `pnpm verify` passes before every commit.
- Never commit `.env` files, tokens or local databases (only `data/devpulse.db`, written by CI).
- `data/devpulse.db` is owned by the Collect workflow; pull before pushing.
