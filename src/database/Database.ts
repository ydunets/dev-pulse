import { SqliteClient, SqliteMigrator } from "@effect/sql-sqlite-node"
import { Config, Effect, Layer, String as Str } from "effect"
import pullRequests from "./migrations/0001_pull_requests.ts"
import collectorRuns from "./migrations/0002_collector_runs.ts"

const migrations = SqliteMigrator.layer({
  loader: SqliteMigrator.fromRecord({
    "0001_pull_requests": pullRequests,
    "0002_collector_runs": collectorRuns
  })
})

const client = (filename: string) =>
  SqliteClient.layer({
    filename,
    transformQueryNames: Str.camelToSnake,
    transformResultNames: Str.snakeToCamel
  })

export const layerFile = (filename: string) => migrations.pipe(Layer.provideMerge(client(filename)))

export const layerMemory = layerFile(":memory:")

export const layer = Layer.unwrap(
  Config.String("DEVPULSE_DB").pipe(
    Config.withDefault("devpulse.db"),
    Effect.map(layerFile)
  )
)
