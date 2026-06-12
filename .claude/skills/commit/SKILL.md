---
name: commit
description: Create git commits that follow this project's Conventional Commits rules — types, scopes, subject formatting, breaking-change and issue-reference footers. Use whenever the user asks to commit, stage and commit, or write a commit message in this repo.
allowed-tools: Bash(git *)
---

# Commit

Author commits for the Expence Tracker repo following [Conventional Commits](https://www.conventionalcommits.org/) — `<type>(<scope>): <description>`.

## Before committing

1. Never commit directly to `main`. If on `main`, create a `<type>/<short-slug>` branch first.
2. Only commit when the user asks.
3. Run `git status` and `git diff` (staged + unstaged) to ground the message in the actual changes. Stage the intended files.
4. End the commit message with the trailer:
   ```
   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
   ```

## Types

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | New user-facing feature                          |
| `fix`      | Bug fix                                          |
| `refactor` | Code change that is neither a fix nor a feature  |
| `style`    | Formatting, whitespace — no logic change         |
| `docs`     | Documentation only (CLAUDE.md, README, comments) |
| `chore`    | Build scripts, deps, config, tooling             |
| `ci`       | CI/CD pipeline changes                           |
| `test`     | Adding or fixing tests                           |

## Scopes (optional, match workspace/package)

- `frontend` — `apps/frontend`
- `backend` — `apps/backend`
- `db` — `packages/db`
- `shared` — `packages/shared`

## Rules

- Description in English, imperative mood, lowercase, no trailing period.
- Subject line ≤ 72 characters.
- Breaking changes: append `!` after type/scope (`feat(backend)!:`) **and** add a `BREAKING CHANGE:` footer.
- Reference issues in the footer: `Closes #123`.

## Never

- Never push automatically.
- Never use `--no-verify` or `--amend` without an explicit request.
- Never stage files without understanding their contents.

## Examples

```
feat(backend): add JWT auth endpoints
fix(frontend): prevent double form submission on login
chore: bump prisma to 5.14
docs: add commit conventions to CLAUDE.md
feat(db)!: rename User table to Account

BREAKING CHANGE: migration required — run prisma:migrate
```
