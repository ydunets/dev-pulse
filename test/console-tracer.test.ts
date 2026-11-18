import { assert, describe, it } from "@effect/vitest"
import { Effect, Tracer } from "effect"
import * as ConsoleTracer from "../src/tracing/ConsoleTracer.ts"

describe("ConsoleTracer", () => {
  it.effect("prints the span tree once the root span ends", () =>
    Effect.gen(function*() {
      const output: Array<string> = []
      const program = Effect.void.pipe(
        Effect.withSpan("child", { attributes: { "github.repo": "acme/app" } }),
        Effect.withSpan("root")
      )

      yield* program.pipe(Effect.provideService(Tracer.Tracer, ConsoleTracer.make((text) => output.push(text))))

      const lines = output.join("\n").split("\n")
      assert.strictEqual(output.length, 1)
      assert.match(lines[1] ?? "", /^✓ root /)
      assert.match(lines[2] ?? "", /^ {2}✓ child .*github\.repo=acme\/app/)
    }))
})
