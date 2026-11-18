import { Schema } from "effect"

export const GitHubErrorReason = Schema.Literals(["NotFound", "Unauthorized", "RateLimited", "Network", "BadResponse"])

export type GitHubErrorReason = typeof GitHubErrorReason.Type

export class GitHubError extends Schema.TaggedError<GitHubError>()("GitHubError", {
  repo: Schema.String,
  reason: GitHubErrorReason,
  cause: Schema.optional(Schema.Defect())
}) {}

export const reasonFromStatus = (status: number): GitHubErrorReason => {
  switch (status) {
    case 401:
      return "Unauthorized"
    case 403:
    case 429:
      return "RateLimited"
    case 404:
      return "NotFound"
    default:
      return "BadResponse"
  }
}
