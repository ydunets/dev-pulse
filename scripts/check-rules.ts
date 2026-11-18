import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const MAX_LINES = 300
const ROOTS = ["src", "test", "scripts"]
const CONSOLE_ALLOWED = ["src/tracing/Tracing.ts", "scripts/check-rules.ts"]

interface Violation {
  readonly file: string
  readonly line: number
  readonly rule: string
}

const listTsFiles = (dir: string): ReadonlyArray<string> =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return listTsFiles(path)
    return path.endsWith(".ts") ? [path] : []
  })

const isComment = (line: string) => /^\s*(\/\/|\/\*|\*)/.test(line) || /\s\/\/\s/.test(line)
const usesConsole = (line: string) => /\bconsole\.(log|error|warn|info|debug)\(/.test(line)

const checkFile = (file: string): ReadonlyArray<Violation> => {
  const lines = readFileSync(file, "utf8").split("\n")
  const sizeViolation = lines.length > MAX_LINES
    ? [{ file, line: lines.length, rule: `file has more than ${MAX_LINES} lines` }]
    : []
  const lineViolations = lines.flatMap((text, index) => [
    ...(isComment(text) ? [{ file, line: index + 1, rule: "no comments" }] : []),
    ...(usesConsole(text) && !CONSOLE_ALLOWED.includes(file)
      ? [{ file, line: index + 1, rule: "no console.* outside allowed files" }]
      : [])
  ])
  return [...sizeViolation, ...lineViolations]
}

const root = process.cwd()
const violations = ROOTS.flatMap((dir) => listTsFiles(join(root, dir)))
  .map((file) => relative(root, file))
  .flatMap(checkFile)

if (violations.length > 0) {
  violations.forEach((v) => console.error(`${v.file}:${v.line}  ${v.rule}`))
  process.exit(1)
}
console.log(`rules ok (${ROOTS.join(", ")})`)
