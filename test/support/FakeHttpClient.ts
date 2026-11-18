import { Effect, Layer } from "effect"
import { HttpClient, HttpClientResponse } from "effect/http"

export interface FakeResponse {
  readonly status: number
  readonly body: unknown
  readonly headers?: Record<string, string>
}

export const layer = (respond: (url: URL) => FakeResponse) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, url) => {
      const { status, body, headers } = respond(url)
      const response = new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json", ...headers }
      })
      return Effect.succeed(HttpClientResponse.fromWeb(request, response))
    })
  )
