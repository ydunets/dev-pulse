import { Effect } from "effect"
import { SqlClient } from "effect/sql"

export default Effect.gen(function*() {
  const sql = yield* SqlClient.SqlClient
  yield* sql`
    CREATE TABLE pull_requests (
      repo       TEXT    NOT NULL,
      number     INTEGER NOT NULL,
      title      TEXT    NOT NULL,
      state      TEXT    NOT NULL,
      author     TEXT,
      url        TEXT    NOT NULL,
      draft      INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL,
      updated_at TEXT    NOT NULL,
      merged_at  TEXT,
      PRIMARY KEY (repo, number)
    )
  `
})
