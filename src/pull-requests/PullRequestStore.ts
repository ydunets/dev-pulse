import { Context, Effect, Layer, Schema } from "effect"
import { SqlClient, SqlSchema } from "effect/sql"
import { PullRequest } from "./PullRequest.ts"

const PullRequestRow = Schema.Struct({
  ...PullRequest.fields,
  draft: Schema.BooleanFromBit
})

export class PullRequestStore extends Context.Service<PullRequestStore, {
  save(pullRequests: ReadonlyArray<PullRequest>): Effect.Effect<number>
  findByRepo(repo: string): Effect.Effect<ReadonlyArray<PullRequest>>
}>()("devpulse/pull-requests/PullRequestStore") {
  static readonly layer = Layer.effect(
    PullRequestStore,
    Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient
      const encodeRow = Schema.encodeEffect(PullRequestRow)

      const save = Effect.fn("PullRequestStore.save")(function*(pullRequests: ReadonlyArray<PullRequest>) {
        const rows = yield* Effect.forEach(pullRequests, (pr) => encodeRow(pr)).pipe(Effect.orDie)
        const [first, ...rest] = rows
        if (!first) return 0
        yield* sql`
          INSERT INTO pull_requests ${sql.insert([first, ...rest])}
          ON CONFLICT (repo, number) DO UPDATE SET
            title = excluded.title,
            state = excluded.state,
            draft = excluded.draft,
            updated_at = excluded.updated_at,
            merged_at = excluded.merged_at
        `.pipe(Effect.orDie)
        return rows.length
      })

      const selectByRepo = SqlSchema.findAll({
        Request: Schema.String,
        Result: PullRequestRow,
        execute: (repo) => sql`SELECT * FROM pull_requests WHERE repo = ${repo} ORDER BY updated_at DESC`
      })

      const findByRepo = Effect.fn("PullRequestStore.findByRepo")((repo: string) =>
        selectByRepo(repo).pipe(
          Effect.map((rows) => rows.map((row) => new PullRequest(row))),
          Effect.orDie
        )
      )

      return PullRequestStore.of({ save, findByRepo })
    })
  )
}
