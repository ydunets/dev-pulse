import { Layer } from "effect"
import { Collector } from "./collector/Collector.ts"
import { CollectorRunStore } from "./collector/CollectorRunStore.ts"
import * as Database from "./database/Database.ts"
import { GitHub } from "./github/GitHub.ts"
import { PullRequestStore } from "./pull-requests/PullRequestStore.ts"
import * as Tracing from "./tracing/Tracing.ts"

export const StoresLayer = Layer.mergeAll(PullRequestStore.layer, CollectorRunStore.layer)

export const AppLayer = Collector.layer.pipe(
  Layer.provideMerge(GitHub.layer),
  Layer.provideMerge(StoresLayer),
  Layer.provide(Database.layer),
  Layer.provideMerge(Tracing.layer)
)
