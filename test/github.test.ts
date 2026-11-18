import { assert, describe, it } from "@effect/vitest"
import { Effect, Layer, Schema } from "effect"
import { GitHub } from "../src/github/GitHub.ts"
import { RepoSlug } from "../src/shared/RepoSlug.ts"
import { githubPullRequestJson } from "./support/fixtures.ts"
import * as FakeHttpClient from "./support/FakeHttpClient.ts"

const repo = Schema.decodeSync(RepoSlug)("acme/app")

const fetchPullRequests = (status: number, body: unknown) =>
  Effect.gen(function*() {
    const github = yield* GitHub
    return yield* github.pullRequests(repo)
  }).pipe(
    Effect.provide(GitHub.layerNoDeps.pipe(Layer.orDie)),
    Effect.provide(FakeHttpClient.layer(() => ({ status, body })))
  )

describe("GitHub", () => {
  it.effect("maps GitHub pull requests to domain pull requests", () =>
    Effect.gen(function*() {
      const prs = yield* fetchPullRequests(200, [
        githubPullRequestJson(),
        githubPullRequestJson({ number: 2, state: "closed", merged_at: "2026-11-03T10:00:00Z", user: null })
      ])

      assert.deepStrictEqual(prs.map((pr) => [pr.number, pr.state, pr.author]), [
        [1, "open", "octocat"],
        [2, "merged", null]
      ])
      assert.strictEqual(prs[0]?.repo, "acme/app")
    }))

  it.effect("fails with NotFound for a missing repo", () =>
    Effect.gen(function*() {
      const error = yield* Effect.flip(fetchPullRequests(404, { message: "Not Found" }))
      assert.strictEqual(error.reason, "NotFound")
    }))

  it.effect("fails with BadResponse when the payload does not match the schema", () =>
    Effect.gen(function*() {
      const error = yield* Effect.flip(fetchPullRequests(200, [{ unexpected: true }]))
      assert.strictEqual(error.reason, "BadResponse")
    }))
})
