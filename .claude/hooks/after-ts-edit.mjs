import { execSync } from "node:child_process"

const readStdin = async () => {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")
}

const run = (command) => {
  try {
    execSync(command, { stdio: "pipe", cwd: process.env.CLAUDE_PROJECT_DIR ?? process.cwd() })
    return ""
  } catch (error) {
    return `${error.stdout ?? ""}${error.stderr ?? ""}`.trim()
  }
}

const input = await readStdin()
const file = input.tool_input?.file_path ?? ""

if (file.endsWith(".ts")) {
  const problems = [run("pnpm -s typecheck"), run("pnpm -s rules")].filter(Boolean)
  if (problems.length > 0) {
    process.stderr.write(`Checks failed after editing ${file}:\n${problems.join("\n")}\n`)
    process.exit(2)
  }
}
