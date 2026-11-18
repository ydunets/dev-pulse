# Code style

- No comments. Names and small functions carry the meaning.
- Files at most 300 lines; functions short, nesting at most 3 levels.
- High cohesion, low coupling: organise by feature, depend on service interfaces, never on another feature's internals.
- Immutable data: build new objects and arrays, do not mutate inputs.
- No `console.*` outside `src/tracing/Tracing.ts` and `scripts/`; use `Console` or `Effect.log`.
- No hardcoded secrets; read configuration with `Config`.
- `pnpm rules` enforces the size, comment and console rules.
