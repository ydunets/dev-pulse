import { assert, describe, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer } from "effect"
import { GitHub } from "../src/github/GitHub.ts"
import * as FakeHttpClient from "./support/FakeHttpClient.ts"

const repository = (full_name: string, fork = false, archived = false) => ({ full_name, fork, archived })

const withGitHub = (respond: Parameters<typeof FakeHttpClient.layer>[0], env: Record<string, string> = {}) =>
  GitHub.layerNoDeps.pipe(
    Layer.provide(FakeHttpClient.layer(respond)),
    Layer.provide(ConfigProvider.layer(ConfigProvider.fromEnv({ env }))),
    Layer.orDie
  )

describe("GitHub.ownedRepositories", () => {
  it.effect("lists an owner's repos without forks or archived ones", () =>
    Effect.gen(function*() {
      const repos = yield* (yield* GitHub).ownedRepositories("ydunets")
      assert.deepStrictEqual(repos, ["ydunets/dev-pulse"])
    }).pipe(Effect.provide(withGitHub(() => ({
      status: 200,
      body: [repository("ydunets/dev-pulse"), repository("ydunets/fork", true), repository("ydunets/old", false, true)]
    })))))

  it.effect("sends GITHUB_TOKEN as a bearer token", () =>
    Effect.gen(function*() {
      yield* (yield* GitHub).ownedRepositories("ydunets")
    }).pipe(Effect.provide(withGitHub((_, headers) => ({
      status: headers.authorization === "Bearer secret" ? 200 : 401,
      body: []
    }), { GITHUB_TOKEN: "secret" }))))
})
