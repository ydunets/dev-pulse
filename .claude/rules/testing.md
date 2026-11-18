# Testing

- Test first: write the failing test, make it pass, then refactor.
- Use `it.effect` from `@effect/vitest` and provide fakes through layers.
- Fakes live in `test/support/`; use `Database.layerMemory` for SQL.
- Coverage threshold is 80% for lines, branches, functions and statements (`pnpm coverage`).
- Test behaviour through public service methods, not private helpers.
- Fix the code, not the test, unless the test is wrong.
