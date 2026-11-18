import { Schema } from "effect"
import { PullRequest } from "../pull-requests/PullRequest.ts"
import type { RepoSlug } from "../shared/RepoSlug.ts"

export class GitHubPullRequest extends Schema.Class<GitHubPullRequest>("GitHubPullRequest")({
  number: Schema.Int,
  title: Schema.String,
  state: Schema.Literals(["open", "closed"]),
  draft: Schema.optional(Schema.Boolean),
  html_url: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  merged_at: Schema.NullOr(Schema.String),
  user: Schema.NullOr(Schema.Struct({ login: Schema.String }))
}) {}

export const toPullRequest = (repo: RepoSlug) => (pr: GitHubPullRequest): PullRequest =>
  new PullRequest({
    repo,
    number: pr.number,
    title: pr.title,
    state: pr.merged_at ? "merged" : pr.state,
    author: pr.user?.login ?? null,
    url: pr.html_url,
    draft: pr.draft ?? false,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    mergedAt: pr.merged_at
  })
