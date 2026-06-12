---
name: create-pr
description: Open a GitHub pull request against main with the gh CLI, following this project's PR title/description conventions. Use whenever the user asks to create, open, or raise a PR. Accepts optional arguments — the PR title and the branch to push.
allowed-tools: Bash(git *), Bash(gh *)
argumentsHint: "title, base_branch (default: main)"
---

# Create PR

Open a pull request for the Expence Tracker repo against `main` using the `gh` CLI,
following the project's [Conventional Commits](https://www.conventionalcommits.org/)
title format and structured Markdown body.

## Arguments

Invoked as `/create-pr [title] [branch]`. Both are optional:

- **`title`** — the PR title. If omitted, derive it from the lead commit on the branch.
- **`branch`** — the branch to push and open the PR from. If omitted, use the current branch.

Parse `$ARGUMENTS`: the first quoted string (or everything before the last token) is the
title; a trailing bare token that looks like a branch name (`<type>/<slug>`) is the branch.
When ambiguous, ask the user rather than guessing.

## Before opening

1. Never open a PR from `main`. If the target branch is `main` (or no branch given and you are
   on `main`), stop and ask the user to name a `<type>/<short-slug>` feature branch first.
2. If a `branch` argument is given and it differs from the current branch, check it out
   (creating it from `main` if it does not exist) before continuing.
3. Run `git status` to confirm the working tree state; make sure intended commits exist.
4. Push the branch with upstream tracking: `git push -u origin <branch>`.
5. Run `git diff main...HEAD` to ground the description in the actual changes.

## Title

Follow Conventional Commits — `<type>(<scope>): <description>`:

- English, imperative mood, lowercase, no trailing period, ≤ 72 characters.
- Use the same types and scopes as commits (`feat`, `fix`, `refactor`, `chore`, `docs`,
  scopes `frontend` / `backend` / `db` / `shared`).
- For a squash-merged single-feature branch the title usually mirrors the lead commit.

## Description (Markdown body)

- **Summary** — 1–3 sentences on what the PR delivers and why.
- **Changes** — bullet list grouped by area (`backend`, `frontend`, `db`, `shared`).
- **Endpoints** — when the API surface changes, list each added/modified route as
  `METHOD /path` with a one-line note (auth, query params, response shape). Omit if none.
- **Test plan** — required. A `- [ ]` checklist of concrete steps a reviewer can run,
  grouped by area, with the command to start each (`npm run dev:backend` /
  `npm run dev:frontend`). Cover happy paths, validation/error cases, and auth.
- **Notes** — migrations, env vars, follow-ups, or manual steps. Omit if empty.

Keep the body in English. Reference issues in a footer: `Closes #123`.

End the body with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Creating the PR

Use `gh pr create --base main` with `--title` and `--body`. Open as a draft
(`--draft`) when the work is still in progress.

Pass the body via a file or heredoc to preserve Markdown:

```bash
gh pr create --base main --title "<title>" --body "$(cat <<'EOF'
## Summary
...
EOF
)"
```

## Never

- Never open a PR from or merge into anything but `main` as the base without an explicit request.
- Never force-push or rewrite history while opening a PR.
- Never invent a test plan you have not derived from the actual diff.

## Examples

```
/create-pr "feat(frontend): add home screen" feat/home-screen
/create-pr "fix(backend): correct login redirect"
/create-pr
```
