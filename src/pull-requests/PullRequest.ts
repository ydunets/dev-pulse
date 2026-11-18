import { Schema } from "effect"

export const PullRequestState = Schema.Literals(["open", "closed", "merged"])

export class PullRequest extends Schema.Class<PullRequest>("PullRequest")({
  repo: Schema.String,
  number: Schema.Int,
  title: Schema.String,
  state: PullRequestState,
  author: Schema.NullOr(Schema.String),
  url: Schema.String,
  draft: Schema.Boolean,
  createdAt: Schema.String,
  updatedAt: Schema.String,
  mergedAt: Schema.NullOr(Schema.String)
}) {}
