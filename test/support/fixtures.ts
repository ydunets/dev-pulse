export const githubPullRequestJson = (overrides: Record<string, unknown> = {}) => ({
  number: 1,
  title: "Add collector",
  state: "open",
  draft: false,
  html_url: "https://github.com/acme/app/pull/1",
  created_at: "2026-11-01T10:00:00Z",
  updated_at: "2026-11-02T10:00:00Z",
  merged_at: null,
  user: { login: "octocat" },
  ...overrides
})
