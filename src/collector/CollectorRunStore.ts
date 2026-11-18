import { Context, Effect, Layer, Schema } from "effect"
import { SqlClient, SqlSchema } from "effect/sql"
import { CollectorRun } from "./CollectorRun.ts"

export class CollectorRunStore extends Context.Service<CollectorRunStore, {
  record(run: CollectorRun): Effect.Effect<void>
  latest(limit: number): Effect.Effect<ReadonlyArray<CollectorRun>>
}>()("devpulse/collector/CollectorRunStore") {
  static readonly layer = Layer.effect(
    CollectorRunStore,
    Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const record = Effect.fn("CollectorRunStore.record")((run: CollectorRun) =>
        sql`INSERT INTO collector_runs ${sql.insert({ ...run })}`.pipe(Effect.asVoid, Effect.orDie)
      )

      const selectLatest = SqlSchema.findAll({
        Request: Schema.Int,
        Result: CollectorRun,
        execute: (limit) => sql`SELECT * FROM collector_runs ORDER BY id DESC LIMIT ${limit}`
      })

      const latest = Effect.fn("CollectorRunStore.latest")((limit: number) =>
        selectLatest(limit).pipe(Effect.orDie)
      )

      return CollectorRunStore.of({ record, latest })
    })
  )
}
