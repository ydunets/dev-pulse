import { Effect, Layer } from "effect"
import { HttpClient, HttpClientResponse } from "effect/http"

export interface FakeResponse {
  readonly status: number
  readonly body: unknown
}

export const layer = (respond: (url: URL) => FakeResponse) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, url) => {
      const { status, body } = respond(url)
      const response = new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" }
      })
      return Effect.succeed(HttpClientResponse.fromWeb(request, response))
    })
  )
