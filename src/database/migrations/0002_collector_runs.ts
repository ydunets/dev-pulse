import { Effect } from "effect"
import { SqlClient } from "effect/sql"

export default Effect.gen(function*() {
  const sql = yield* SqlClient.SqlClient
  yield* sql`
    CREATE TABLE collector_runs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      repo       TEXT    NOT NULL,
      started_at TEXT    NOT NULL,
      status     TEXT    NOT NULL,
      items      INTEGER NOT NULL DEFAULT 0,
      error      TEXT
    )
  `
})
