import { Schema } from "effect"

export const RepoSlug = Schema.String.check(Schema.isPattern(/^[\w.-]+\/[\w.-]+$/)).pipe(Schema.brand("RepoSlug"))

export type RepoSlug = typeof RepoSlug.Type

export class InvalidRepoSlug extends Schema.TaggedError<InvalidRepoSlug>()("InvalidRepoSlug", {
  input: Schema.String
}) {}
