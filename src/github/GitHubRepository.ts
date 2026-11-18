import { Schema } from "effect"

export class GitHubRepository extends Schema.Class<GitHubRepository>("GitHubRepository")({
  full_name: Schema.String,
  fork: Schema.Boolean,
  archived: Schema.Boolean
}) {}

export const isActiveSource = (repo: GitHubRepository) => !repo.fork && !repo.archived
