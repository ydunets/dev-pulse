import { assert, describe, it } from "@effect/vitest"
import { reasonFromResponse } from "../src/github/GitHubError.ts"

describe("reasonFromResponse", () => {
  it("maps each status to a reason", () => {
    const cases = [
      [401, undefined, "Unauthorized"],
      [403, undefined, "Forbidden"],
      [403, "0", "RateLimited"],
      [404, undefined, "NotFound"],
      [429, undefined, "RateLimited"],
      [500, undefined, "BadResponse"]
    ] as const
    for (const [status, remaining, expected] of cases) {
      assert.strictEqual(reasonFromResponse(status, remaining), expected)
    }
  })
})
