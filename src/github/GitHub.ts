import { Config, Context, Effect, flow, Layer, Option, Redacted, Schedule, Schema } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
  type UrlParams
} from "effect/http"
import type { PullRequest } from "../pull-requests/PullRequest.ts"
import type { RepoSlug } from "../shared/RepoSlug.ts"
import { GitHubError, reasonFromResponse } from "./GitHubError.ts"
import { GitHubPullRequest, toPullRequest } from "./GitHubPullRequest.ts"
import { GitHubRepository, isActiveSource } from "./GitHubRepository.ts"

const withToken = (token: Option.Option<Redacted.Redacted>) => (request: HttpClientRequest.HttpClientRequest) =>
  Option.match(token, {
    onNone: () => request,
    onSome: (value) => HttpClientRequest.bearerToken(request, Redacted.value(value))
  })

export class GitHub extends Context.Service<GitHub, {
  pullRequests(repo: RepoSlug): Effect.Effect<ReadonlyArray<PullRequest>, GitHubError>
  ownedRepositories(owner: string): Effect.Effect<ReadonlyArray<string>, GitHubError>
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

      const getJson = <S extends Schema.Constraint>(
        subject: string,
        path: string,
        urlParams: UrlParams.Input,
        schema: S
      ) =>
        Effect.gen(function*() {
          const response = yield* client.get(path, { urlParams }).pipe(
            Effect.mapError((cause) => new GitHubError({ repo: subject, reason: "Network", cause }))
          )
          if (response.status >= 400) {
            const reason = reasonFromResponse(response.status, response.headers["x-ratelimit-remaining"])
            return yield* new GitHubError({ repo: subject, reason })
          }
          return yield* HttpClientResponse.schemaBodyJson(schema)(response).pipe(
            Effect.mapError((cause) => new GitHubError({ repo: subject, reason: "BadResponse", cause }))
          )
        })

      const pullRequests = Effect.fn("GitHub.pullRequests")(function*(repo: RepoSlug) {
        yield* Effect.annotateCurrentSpan({ "github.repo": repo })
        const items = yield* getJson(
          repo,
          `/repos/${repo}/pulls`,
          { state: "all", per_page: "50", sort: "updated", direction: "desc" },
          Schema.Array(GitHubPullRequest)
        )
        return items.map(toPullRequest(repo))
      })

      const ownedRepositories = Effect.fn("GitHub.ownedRepositories")(function*(owner: string) {
        yield* Effect.annotateCurrentSpan({ "github.owner": owner })
        const repos = yield* getJson(
          owner,
          `/users/${owner}/repos`,
          { type: "owner", per_page: "100", sort: "pushed" },
          Schema.Array(GitHubRepository)
        )
        return repos.filter(isActiveSource).map((repo) => repo.full_name)
      })

      return GitHub.of({ pullRequests, ownedRepositories })
    })
  )

  static readonly layer = GitHub.layerNoDeps.pipe(Layer.provide(FetchHttpClient.layer))
}
