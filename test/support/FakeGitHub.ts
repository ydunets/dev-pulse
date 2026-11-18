import { Effect, Layer } from "effect"
import { GitHub } from "../../src/github/GitHub.ts"
import { GitHubError, type GitHubErrorReason } from "../../src/github/GitHubError.ts"
import type { PullRequest } from "../../src/pull-requests/PullRequest.ts"

export type FakeRepo = ReadonlyArray<PullRequest> | GitHubErrorReason

export const layer = (repos: Record<string, FakeRepo>) =>
  Layer.succeed(
    GitHub,
    GitHub.of({
      pullRequests: (repo) => {
        const entry = repos[repo] ?? "NotFound"
        return typeof entry === "string"
          ? Effect.fail(new GitHubError({ repo, reason: entry }))
          : Effect.succeed(entry)
      }
    })
  )
