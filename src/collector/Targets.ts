import { Config, Effect, Schema } from "effect"
import { GitHub } from "../github/GitHub.ts"

export interface TargetSettings {
  readonly repos: ReadonlyArray<string>
  readonly owners: ReadonlyArray<string>
}

const listSetting = (name: string) =>
  Config.Array(Schema.String, name).pipe(Config.withDefault<ReadonlyArray<string>>([]))

export const settingsFromConfig = Config.all({
  repos: listSetting("DEVPULSE_REPOS"),
  owners: listSetting("DEVPULSE_OWNERS")
})

export const resolve = Effect.fn("Targets.resolve")(function*(settings: TargetSettings) {
  const github = yield* GitHub
  const owned = yield* Effect.forEach(settings.owners, github.ownedRepositories, { concurrency: 4 })
  const unique = new Map(
    [...settings.repos, ...owned.flat()].map((repo) => [repo.trim().toLowerCase(), repo.trim()] as const)
  )
  yield* Effect.annotateCurrentSpan({ "collector.targets": unique.size })
  return [...unique.values()].filter((repo) => repo.length > 0)
})
