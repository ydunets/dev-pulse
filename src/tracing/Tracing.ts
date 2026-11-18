import { Config, Effect, Layer, Option, Tracer } from "effect"
import { FetchHttpClient } from "effect/http"
import { OtlpSerialization, OtlpTracer } from "effect/observability"
import * as ConsoleTracer from "./ConsoleTracer.ts"

const otlp = (endpoint: string) =>
  OtlpTracer.layer({
    url: `${endpoint.replace(/\/$/, "")}/v1/traces`,
    resource: { serviceName: "devpulse", serviceVersion: "0.1.0" }
  }).pipe(
    Layer.provide(OtlpSerialization.layerJson),
    Layer.provide(FetchHttpClient.layer)
  )

const console = Layer.succeed(Tracer.Tracer, ConsoleTracer.make(globalThis.console.log))

export const layer = Layer.unwrap(
  Config.option(Config.String("OTEL_EXPORTER_OTLP_ENDPOINT")).pipe(
    Effect.map(Option.match({ onSome: otlp, onNone: () => console }))
  )
)
