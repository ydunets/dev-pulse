import { Effect, Layer } from "effect"
import { GitHub } from "../../src/github/GitHub.ts"
import { GitHubError, type GitHubErrorReason } from "../../src/github/GitHubError.ts"
import type { PullRequest } from "../../src/pull-requests/PullRequest.ts"

export type FakeRepo = ReadonlyArray<PullRequest> | GitHubErrorReason

export interface FakeGitHubData {
  readonly repos?: Record<string, FakeRepo>
  readonly owners?: Record<string, ReadonlyArray<string>>
}

const lookup = <A extends object>(entry: A | GitHubErrorReason | undefined, subject: string) => {
  if (entry === undefined) return Effect.fail(new GitHubError({ repo: subject, reason: "NotFound" }))
  if (typeof entry === "string") return Effect.fail(new GitHubError({ repo: subject, reason: entry }))
  return Effect.succeed(entry)
}

export const layer = ({ repos = {}, owners = {} }: FakeGitHubData) =>
  Layer.succeed(
    GitHub,
    GitHub.of({
      pullRequests: (repo) => lookup(repos[repo], repo),
      ownedRepositories: (owner) => lookup(owners[owner], owner)
    })
  )
