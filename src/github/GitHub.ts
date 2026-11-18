import { Config, Context, Effect, flow, Layer, Option, Redacted, Schedule, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http"
import type { PullRequest } from "../pull-requests/PullRequest.ts"
import type { RepoSlug } from "../shared/RepoSlug.ts"
import { GitHubError, reasonFromStatus } from "./GitHubError.ts"
import { GitHubPullRequest, toPullRequest } from "./GitHubPullRequest.ts"

const withToken = (token: Option.Option<Redacted.Redacted>) => (request: HttpClientRequest.HttpClientRequest) =>
  Option.match(token, {
    onNone: () => request,
    onSome: (value) => HttpClientRequest.bearerToken(request, Redacted.value(value))
  })

export class GitHub extends Context.Service<GitHub, {
  pullRequests(repo: RepoSlug): Effect.Effect<ReadonlyArray<PullRequest>, GitHubError>
}>()("devpulse/github/GitHub") {
  static readonly layerNoDeps = Layer.effect(
    GitHub,
    Effect.gen(function*() {
      const token = yield* Config.option(Config.Redacted("GITHUB_TOKEN"))
      const client = (yield* HttpClient.HttpClient).pipe(
        HttpClient.mapRequest(flow(
          HttpClientRequest.prependUrl("https://api.github.com"),
          HttpClientRequest.acceptJson,
          HttpClientRequest.setHeader("User-Agent", "devpulse"),
          withToken(token)
        )),
        HttpClient.retryTransient({ times: 3, schedule: Schedule.exponential("200 millis") })
      )
      const decodePullRequests = HttpClientResponse.schemaBodyJson(Schema.Array(GitHubPullRequest))

      const pullRequests = Effect.fn("GitHub.pullRequests")(function*(repo: RepoSlug) {
        yield* Effect.annotateCurrentSpan({ "github.repo": repo })
        const response = yield* client.get(`/repos/${repo}/pulls`, {
          urlParams: { state: "all", per_page: "50", sort: "updated", direction: "desc" }
        }).pipe(Effect.mapError((cause) => new GitHubError({ repo, reason: "Network", cause })))

        if (response.status >= 400) {
          return yield* new GitHubError({ repo, reason: reasonFromStatus(response.status) })
        }

        const items = yield* decodePullRequests(response).pipe(
          Effect.mapError((cause) => new GitHubError({ repo, reason: "BadResponse", cause }))
        )
        return items.map(toPullRequest(repo))
      })

      return GitHub.of({ pullRequests })
    })
  )

  static readonly layer = GitHub.layerNoDeps.pipe(Layer.provide(FetchHttpClient.layer))
}
