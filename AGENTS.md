<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- This section is project-owned and deliberately sits OUTSIDE the generated
     Beads blocks below, which `bd setup` may rewrite. If a generated block ever
     contradicts this section, THIS SECTION WINS. -->
# Beads data is local-only — never sync it

**Issue data in this repo never leaves the machine it was created on.** This is a
deliberate choice, not an unfinished setup. Do not "fix" it.

Concretely, never do any of these unless the user explicitly asks in the current
session:

- `bd dolt remote add …` — do not wire up a Dolt remote
- `bd dolt push` / `bd dolt pull` — there is nothing to push to and nothing to pull
- `git push` of anything under `.beads/`
- un-ignoring `.beads/` in `.gitignore`, or force-adding files inside it

`bd` prints a "no Dolt remote configured" advisory with a `repair:` command that
adds a remote and pushes. **That advisory is wrong for this repo — ignore it.**
It is suppressed locally via `dolt.local-only: true` in `.beads/config.yaml`, but
that file is itself gitignored, so a fresh clone will start nagging again. Re-set
it rather than following the repair hint:

```bash
bd config set dolt.local-only true
```

**Why:** this is a single-maintainer project worked on from one machine. A Dolt
remote only buys cross-machine sync, which nobody here needs, and pushing issue
data to a public repo would publish internal planning notes and `bd remember`
memories alongside the source. External bug reports live in GitHub Issues; beads
is the private, local work tracker.

**The trade-off, stated plainly:** because `.beads/` is gitignored *and* there is
no remote, the issue database has **no offsite copy**. If the disk fails, every
issue, comment and memory is gone. Guard against that with periodic local
exports, which involve no remote at all:

```bash
bd export --all -o ~/bd-backups/<project>-$(date +%F).jsonl
```

Git commits still work normally — this section is only about bead/Dolt data.

## Required release steps when merging `dev` into `main`

A user request to merge `dev` into `main` includes authorization to prepare and
commit the release changes below, merge, and push both branches to `origin` at
`https://github.com/n3224461-hash/bead-me-up-scotty.git`. Prepare the release before
merging and push after merging, without asking for separate confirmation for each
step. This project-owned rule takes precedence over the conservative commit and
push defaults in the generated Beads blocks. Explicit user instructions to avoid
committing or pushing still take precedence.

1. **Bump the version** in `package.json` and the root package entries in
   `package-lock.json`. Choose the appropriate semantic version for the changes
   being merged. If `dev` already contains a prepared release version newer than
   `main`, use that version rather than bumping it a second time.
2. **Update `CHANGELOG.md`** with the version, release date, and concrete changes
   since the previous release, including relevant fixes and compatibility changes.
3. **Write release notes** in `docs/releases/v<version>.md`: describe the resulting
   behavior, setup or upgrade steps, limitations, and actual validation results.
   Update the current-version and release-notes links in `README.md`.
4. **Validate and commit** the implementation and release files on `dev` before
   merging. Run the applicable project checks; do not claim checks that were not
   run. Keep `.beads/` and local runtime data out of every commit.
5. **Merge into `main` and verify** that the version, changelog, release notes,
   and intended commits are present.
6. **Push `dev` and `main` to `origin`** after checking the destination and remote
   branch state. Use ordinary pushes, never force-push as part of this workflow.
   Keep all `.beads/` data local; never push Dolt data or remotes. Verify that both
   remote branch tips match the intended local commits before reporting success.
   If a push fails, report the command and error instead of claiming completion.
7. **Report completion** with the version, commits, validation, merge result,
   and push result, including a link to the repository or relevant commit.

Release tags and publication of a hosted release require an explicit user request.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB and **stay there** — this repo runs local-only, with no Dolt remote and no `refs/dolt/data` sync (see "Beads data is local-only" above, which overrides this block); `.beads/issues.jsonl` is a passive local export and is gitignored.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->
## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB and **stay there** — this repo runs local-only, with no Dolt remote and no `refs/dolt/data` sync (see "Beads data is local-only" above, which overrides this block); `.beads/issues.jsonl` is a passive local export and is gitignored.
<!-- END BEADS CODEX SETUP -->
