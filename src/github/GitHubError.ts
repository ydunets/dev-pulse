import { Schema } from "effect"

export const GitHubErrorReason = Schema.Literals([
  "NotFound",
  "Unauthorized",
  "Forbidden",
  "RateLimited",
  "Network",
  "BadResponse"
])

export type GitHubErrorReason = typeof GitHubErrorReason.Type

export class GitHubError extends Schema.TaggedError<GitHubError>()("GitHubError", {
  repo: Schema.String,
  reason: GitHubErrorReason,
  cause: Schema.optional(Schema.Defect())
}) {}

export const reasonFromResponse = (status: number, rateLimitRemaining: string | undefined): GitHubErrorReason => {
  if (status === 429 || (status === 403 && rateLimitRemaining === "0")) return "RateLimited"
  switch (status) {
    case 401:
      return "Unauthorized"
    case 403:
      return "Forbidden"
    case 404:
      return "NotFound"
    default:
      return "BadResponse"
  }
}
