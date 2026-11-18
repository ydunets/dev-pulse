import { Context, DateTime, Effect, Layer, Schema } from "effect"
import { GitHub } from "../github/GitHub.ts"
import { PullRequestStore } from "../pull-requests/PullRequestStore.ts"
import { InvalidRepoSlug, RepoSlug } from "../shared/RepoSlug.ts"
import { CollectorRun } from "./CollectorRun.ts"
import { CollectorRunStore } from "./CollectorRunStore.ts"

const MAX_CONCURRENT_REPOS = 4

export class Collector extends Context.Service<Collector, {
  collect(repos: ReadonlyArray<string>): Effect.Effect<ReadonlyArray<CollectorRun>>
}>()("devpulse/collector/Collector") {
  static readonly layer = Layer.effect(
    Collector,
    Effect.gen(function*() {
      const github = yield* GitHub
      const pullRequests = yield* PullRequestStore
      const runs = yield* CollectorRunStore
      const decodeRepo = Schema.decodeUnknownEffect(RepoSlug)

      const fetchAndSave = (repo: RepoSlug) =>
        github.pullRequests(repo).pipe(
          Effect.flatMap(pullRequests.save),
          Effect.map((items) => ({ status: "ok" as const, items, error: null })),
          Effect.catchTag("GitHubError", (e) => Effect.succeed({ status: "failed" as const, items: 0, error: e.reason }))
        )

      const collectOne = Effect.fn("Collector.collectOne")(function*(input: string) {
        yield* Effect.annotateCurrentSpan({ "github.repo": input })
        const startedAt = DateTime.formatIso(yield* DateTime.now)
        const outcome = yield* decodeRepo(input).pipe(
          Effect.mapError(() => new InvalidRepoSlug({ input })),
          Effect.flatMap(fetchAndSave),
          Effect.catchTag("InvalidRepoSlug", () =>
            Effect.succeed({ status: "failed" as const, items: 0, error: "InvalidRepoSlug" }))
        )
        const run = new CollectorRun({ repo: input, startedAt, ...outcome })
        yield* runs.record(run)
        return run
      })

      const collect = Effect.fn("Collector.collect")(function*(repos: ReadonlyArray<string>) {
        yield* Effect.annotateCurrentSpan({ "collector.repos": repos.length })
        return yield* Effect.forEach(repos, collectOne, { concurrency: MAX_CONCURRENT_REPOS })
      })

      return Collector.of({ collect })
    })
  )
}
