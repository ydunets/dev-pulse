import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import * as Targets from "../src/collector/Targets.ts"
import * as FakeGitHub from "./support/FakeGitHub.ts"

const github = FakeGitHub.layer({ owners: { ydunets: ["ydunets/dev-pulse", "ydunets/ui-kit"] } })

describe("Targets", () => {
  it.effect("combines explicit repos with repos discovered from owners, without duplicates", () =>
    Effect.gen(function*() {
      const repos = yield* Targets.resolve({
        repos: ["Effect-TS/effect", "YDUNETS/dev-pulse"],
        owners: ["ydunets"]
      })
      assert.deepStrictEqual(repos, ["Effect-TS/effect", "ydunets/dev-pulse", "ydunets/ui-kit"])
    }).pipe(Effect.provide(github)))

  it.effect("fails loudly when an owner cannot be listed", () =>
    Effect.gen(function*() {
      const error = yield* Effect.flip(Targets.resolve({ repos: [], owners: ["ghost"] }))
      assert.deepStrictEqual([error.repo, error.reason], ["ghost", "NotFound"])
    }).pipe(Effect.provide(github)))
})
