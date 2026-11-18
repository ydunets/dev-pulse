import { NodeRuntime } from "@effect/platform-node"
import { Console, Effect } from "effect"
import { AppLayer } from "./AppLayer.ts"
import { Collector } from "./collector/Collector.ts"
import type { CollectorRun } from "./collector/CollectorRun.ts"
import * as Targets from "./collector/Targets.ts"

const targetSettings = Effect.gen(function*() {
  const fromConfig = yield* Targets.settingsFromConfig
  const args = process.argv.slice(2)
  return args.length > 0 ? { repos: args, owners: [] } : fromConfig
})

const formatRun = (run: CollectorRun) =>
  run.status === "ok" ? `  ✓ ${run.repo}: ${run.items} pull requests` : `  ✗ ${run.repo}: ${run.error}`

const program = Effect.gen(function*() {
  const repos = yield* Targets.resolve(yield* targetSettings)
  if (repos.length === 0) {
    return yield* Console.log("Nothing to collect: pass owner/repo arguments or set DEVPULSE_REPOS / DEVPULSE_OWNERS.")
  }
  const runs = yield* (yield* Collector).collect(repos)
  yield* Console.log(["", `Collected ${runs.length} repo(s):`, ...runs.map(formatRun)].join("\n"))
})

program.pipe(Effect.provide(AppLayer), NodeRuntime.runMain)
