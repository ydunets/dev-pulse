import { NodeRuntime } from "@effect/platform-node"
import { Config, Console, Effect, Schema } from "effect"
import { AppLayer } from "./AppLayer.ts"
import { Collector } from "./collector/Collector.ts"
import type { CollectorRun } from "./collector/CollectorRun.ts"

const DEFAULT_REPOS: ReadonlyArray<string> = ["Effect-TS/effect"]

const reposToCollect = Effect.gen(function*() {
  const args = process.argv.slice(2)
  if (args.length > 0) return args
  return yield* Config.Array(Schema.String, "DEVPULSE_REPOS").pipe(Config.withDefault(DEFAULT_REPOS))
})

const formatRun = (run: CollectorRun) =>
  run.status === "ok" ? `  ✓ ${run.repo}: ${run.items} pull requests` : `  ✗ ${run.repo}: ${run.error}`

const program = Effect.gen(function*() {
  const collector = yield* Collector
  const runs = yield* collector.collect(yield* reposToCollect)
  yield* Console.log(["", `Collected ${runs.length} repo(s):`, ...runs.map(formatRun)].join("\n"))
})

program.pipe(Effect.provide(AppLayer), NodeRuntime.runMain)
