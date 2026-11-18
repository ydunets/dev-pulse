import { Schema } from "effect"

export class CollectorRun extends Schema.Class<CollectorRun>("CollectorRun")({
  repo: Schema.String,
  startedAt: Schema.String,
  status: Schema.Literals(["ok", "failed"]),
  items: Schema.Int,
  error: Schema.NullOr(Schema.String)
}) {}
