import { Exit, Option, Tracer } from "effect"

interface FinishedSpan {
  readonly span: Tracer.NativeSpan
  readonly durationMs: number
  readonly ok: boolean
}

const MAX_VALUE_LENGTH = 60
const SHOWN_ATTRIBUTES = ["github.repo", "collector.repos", "http.response.status_code", "db.query.text"]

const formatValue = (value: unknown) => {
  const text = String(value).replace(/\s+/g, " ").trim()
  return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text
}

const formatAttributes = (span: Tracer.NativeSpan) =>
  [...span.attributes]
    .filter(([key]) => SHOWN_ATTRIBUTES.includes(key))
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join(" ")

const formatLine = (node: FinishedSpan, depth: number) => {
  const icon = node.ok ? "✓" : "✗"
  const attributes = formatAttributes(node.span)
  const suffix = attributes ? `  ${attributes}` : ""
  return `${"  ".repeat(depth)}${icon} ${node.span.name} ${node.durationMs.toFixed(1)}ms${suffix}`
}

export const make = (print: (text: string) => void): Tracer.Tracer => {
  const childrenByParent = new Map<string, Array<FinishedSpan>>()

  const addChild = (parentId: string, node: FinishedSpan) => {
    const siblings = childrenByParent.get(parentId) ?? []
    siblings.push(node)
    childrenByParent.set(parentId, siblings)
  }

  const takeChildren = (spanId: string) => {
    const children = childrenByParent.get(spanId) ?? []
    childrenByParent.delete(spanId)
    return children.sort((a, b) => Number(a.span.startTime - b.span.startTime))
  }

  const render = (node: FinishedSpan, depth: number): Array<string> => [
    formatLine(node, depth),
    ...takeChildren(node.span.spanId).flatMap((child) => render(child, depth + 1))
  ]

  return Tracer.make({
    span(options) {
      const span = new Tracer.NativeSpan(options)
      const end = span.end.bind(span)
      span.end = (endTime, exit) => {
        end(endTime, exit)
        const node = { span, durationMs: Number(endTime - span.startTime) / 1e6, ok: Exit.isSuccess(exit) }
        Option.match(options.parent, {
          onSome: (parent) => addChild(parent.spanId, node),
          onNone: () => print([`── trace ${span.traceId.slice(0, 8)} ──`, ...render(node, 0)].join("\n"))
        })
      }
      return span
    }
  })
}
