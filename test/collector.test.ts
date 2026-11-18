import { assert, describe, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { StoresLayer } from "../src/AppLayer.ts"
import { Collector } from "../src/collector/Collector.ts"
import { CollectorRunStore } from "../src/collector/CollectorRunStore.ts"
import * as Database from "../src/database/Database.ts"
import { PullRequest } from "../src/pull-requests/PullRequest.ts"
import { PullRequestStore } from "../src/pull-requests/PullRequestStore.ts"
import * as FakeGitHub from "./support/FakeGitHub.ts"

const pullRequest = (overrides: Partial<PullRequest> = {}) =>
  new PullRequest({
    repo: "acme/app",
    number: 1,
    title: "Add collector",
    state: "open",
    author: "octocat",
    url: "https://github.com/acme/app/pull/1",
    draft: false,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-02T10:00:00Z",
    mergedAt: null,
    ...overrides
  })

const testLayer = (repos: Record<string, FakeGitHub.FakeRepo>) =>
  Collector.layer.pipe(
    Layer.provide(FakeGitHub.layer(repos)),
    Layer.provideMerge(StoresLayer),
    Layer.provide(Database.layerMemory)
  )

describe("Collector", () => {
  it.effect("stores pull requests and records a successful run", () =>
    Effect.gen(function*() {
      const runs = yield* (yield* Collector).collect(["acme/app"])
      const stored = yield* (yield* PullRequestStore).findByRepo("acme/app")

      assert.deepStrictEqual(runs.map((r) => [r.repo, r.status, r.items]), [["acme/app", "ok", 2]])
      assert.deepStrictEqual(stored.map((pr) => pr.number).sort(), [1, 2])
      assert.strictEqual(stored.find((pr) => pr.number === 2)?.draft, true)
    }).pipe(Effect.provide(testLayer({
      "acme/app": [pullRequest(), pullRequest({ number: 2, draft: true })]
    }))))

  it.effect("keeps going when one repo fails and records the failure", () =>
    Effect.gen(function*() {
      const runs = yield* (yield* Collector).collect(["acme/app", "acme/private", "not a slug"])
      const recorded = yield* (yield* CollectorRunStore).latest(10)

      assert.deepStrictEqual(runs.map((r) => [r.repo, r.status, r.error]), [
        ["acme/app", "ok", null],
        ["acme/private", "failed", "Unauthorized"],
        ["not a slug", "failed", "InvalidRepoSlug"]
      ])
      assert.strictEqual(recorded.length, 3)
    }).pipe(Effect.provide(testLayer({
      "acme/app": [pullRequest()],
      "acme/private": "Unauthorized"
    }))))

  it.effect("updates existing pull requests instead of duplicating them", () =>
    Effect.gen(function*() {
      const store = yield* PullRequestStore
      yield* store.save([pullRequest()])
      yield* store.save([pullRequest({ state: "merged", mergedAt: "2026-11-05T10:00:00Z" })])
      const stored = yield* store.findByRepo("acme/app")

      assert.strictEqual(stored.length, 1)
      assert.strictEqual(stored[0]?.state, "merged")
    }).pipe(Effect.provide(StoresLayer.pipe(Layer.provide(Database.layerMemory)))))
})
