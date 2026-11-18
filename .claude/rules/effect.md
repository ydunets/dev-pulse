# Effect v4 conventions

- Read `node_modules/effect/CLAUDE.md` and the installed `.d.ts` files; do not rely on v3 APIs from memory.
- Services: `class X extends Context.Service<X, {...}>()("devpulse/<feature>/X")`, implemented with `X.of({...})`.
- Layers as statics: `layerNoDeps` (requires dependencies) and `layer` (wired for production).
- Reusable effectful functions: `Effect.fn("Service.method")`; annotate spans with useful attributes.
- Errors: `Schema.TaggedError` with a literal `reason`; recover with `Effect.catchTag`.
- Validate all external data with `Schema` (HTTP bodies, SQL rows, config, CLI input).
- Infrastructure failures that callers cannot handle (SQL errors) become defects with `Effect.orDie`.
- Use `DateTime`/`Clock`, never `Date.now()`.
