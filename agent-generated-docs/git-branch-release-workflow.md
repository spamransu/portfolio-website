# Portfolio Website Git branch, release, and cleanup workflow

This repository uses `development` as the integration branch and `main` as the production branch. The workflow preserves focused feature history and one explicit release boundary without adding a second, content-identical sync merge after every release.

Use this workflow unless the user gives a different instruction in the current task.

## Branch model

Normal release:

```text
feat/* or fix/*
        |
        | merge commit
        v
development
        |
        | one release merge commit
        v
main ---- annotated tag vX.Y.Z
        |
        | fast-forward only
        v
development
```

Create `release/vX.Y.Z` only when the release needs stabilization, release preparation, or release-blocking fixes. A branch that would point at the unchanged `development` tip is unnecessary.

Core rules:

- Start feature and fix branches from `development`, not `main`.
- Keep work branches focused and short-lived.
- Use Conventional Commit-style messages for normal commits, for example `feat: ...`, `fix: ...`, `docs: ...`, and `chore: ...`.
- Preserve feature/fix branch history with merge commits. Do not squash or rebase completed branch merges unless the user explicitly asks.
- Refuse a release when the version tag already exists, `main` is not an ancestor of the release source, or the release source has no content changes from `main`.
- Merge the selected release source into `main` once with `--no-ff`, then create an annotated tag on that merge commit.
- Publish `main` and the tag atomically.
- Fast-forward `development` to the released `main`; never force a second sync-back merge commit.
- Delete short-lived branches only after verifying they are merged locally and remotely.

## Historical baseline

Releases `v0.0.1` through `v0.0.3` used two release-related merge commits: one release merge into `main` and one forced `main`-to-`development` sync merge. The sync commits were content-identical to their tagged release commits. This workflow supersedes that part of the old pattern: keep the release merge, but synchronize `development` with `--ff-only`.

## 1. Orient before changing branches

Set the intended version without the leading `v`:

```bash
VERSION="0.0.4"
WORK_BRANCH="feat/descriptive-name"
```

Then inspect current and remote state:

```bash
git status --short --branch
git remote -v
git fetch --all --prune
git branch -vv
git branch -r
git tag --sort=-version:refname | head
git ls-remote --tags origin "refs/tags/v$VERSION"
```

Confirm:

- the working tree is clean or contains only expected changes
- `origin` is the expected remote
- `development` and `main` track their remote branches
- neither a local nor remote `v$VERSION` tag exists
- any optional `release/v$VERSION` branch name is unused

## 2. Create a feature or fix branch

Create the work branch from an up-to-date `development` branch:

```bash
git switch development
git pull --ff-only origin development
git switch -c "$WORK_BRANCH"
git push -u origin "$WORK_BRANCH"
```

Commit focused changes:

```bash
git status --short
git diff
git add <specific-files>
git diff --cached
git commit -m "feat: describe the completed change"
git push
```

Prefer `git add <specific-files>` over `git add .` when the working tree has unrelated or generated files.

## 3. Validate before merging work

For content edits:

```bash
pnpm run prebuild
```

For structure, React, styling, build, or generated-output changes:

```bash
pnpm run prebuild
pnpm build
```

If browser behavior or layout matters, verify the rendered output as well. Keep Playwright artifacts inside `.playwright/`, `.playwright-cli/`, or `.playwright-mcp/`.

Review the branch before merging:

```bash
git log --oneline development..HEAD
git diff --stat development...HEAD
git status --short --branch
```

## 4. Merge work into `development`

```bash
git switch development
git pull --ff-only origin development
git merge --no-ff "$WORK_BRANCH" -m "Merge branch '$WORK_BRANCH' into development"
git push origin development
```

If a pull request is used, target `development` and choose a merge commit. Do not choose squash or rebase merge unless the user explicitly asks.

## 5. Select the release source

### Normal release: use `development`

When all intended work is already validated and no release-only changes are required:

```bash
RELEASE_SOURCE="development"
```

Do not create and push a throwaway release branch that would point at the same commit.

### Stabilized release: create a release branch

Only when release preparation or release-blocking fixes are required:

```bash
RELEASE_BRANCH="release/v$VERSION"

git switch development
git pull --ff-only origin development
git switch -c "$RELEASE_BRANCH"
git push -u origin "$RELEASE_BRANCH"

# Make and validate only release-specific changes, then:
git add <release-files>
git diff --cached
git commit -m "chore(release): prepare v$VERSION"
git push

RELEASE_SOURCE="$RELEASE_BRANCH"
```

Do not add unrelated feature work to a release branch, and do not create empty release-preparation commits.

## 6. Run release preflight

Update both long-lived branches before evaluating the release:

```bash
git fetch --all --prune
git switch development
git pull --ff-only origin development
git switch main
git pull --ff-only origin main
```

Run these checks against the selected release source:

```bash
# Must succeed: the release source builds on the currently published main.
git merge-base --is-ancestor main "$RELEASE_SOURCE"

# Must show the intended unreleased commits.
git log --oneline main.."$RELEASE_SOURCE"

# Must show release content changes. Exit instead of releasing an unchanged tree.
if git diff --quiet main "$RELEASE_SOURCE"; then
  echo "Refusing release: $RELEASE_SOURCE has no content changes from main."
  exit 1
fi

# Must print nothing locally or remotely.
git tag --list "v$VERSION"
git ls-remote --tags origin "refs/tags/v$VERSION"
```

If the ancestry check fails, stop and reconcile the branches. Do not replace it with a fallback merge that hides unexpected divergence. If either tag check prints a result, choose a new version or explicitly resolve the existing tag before continuing.

Run the complete release validation after these checks and before merging into `main`.

## 7. Merge once into `main`, tag, and publish atomically

```bash
git switch main
git merge --no-ff "$RELEASE_SOURCE" -m "chore(release): publish v$VERSION"
git tag -a "v$VERSION" -m "v$VERSION"
```

Verify the merge and tag before publishing:

```bash
git status --short --branch
git show --no-patch --decorate HEAD
git show --no-patch "v$VERSION"
git tag --points-at HEAD
git diff --exit-code "$RELEASE_SOURCE"..HEAD
git log --graph --oneline --decorate --max-count=20
```

Publish `main` and the tag as one atomic remote update:

```bash
git push --atomic origin main "v$VERSION"
```

If either reference cannot be published, the remote updates neither one. Do not rewrite or move a published release tag unless the user explicitly approves it.

## 8. Fast-forward `development` after release

The release merge has the release source as a parent, so `development` must be able to fast-forward to it:

```bash
git switch development
git pull --ff-only origin development
git merge --ff-only main
git push origin development
```

If `--ff-only` fails, stop and inspect the divergence. Do not create another merge commit merely to force synchronization.

## 9. Clean up short-lived branches

Only clean up after the release is merged, tagged, atomically published, and synchronized to `development`.

```bash
git switch development
git fetch --all --prune
git branch --merged development
git branch -r --merged origin/development
```

Delete the work branch after confirming it appears in the merged lists:

```bash
git branch -d "$WORK_BRANCH"
git push origin --delete "$WORK_BRANCH"
```

If an optional release branch was used, verify and delete it too:

```bash
git branch -d "$RELEASE_BRANCH"
git push origin --delete "$RELEASE_BRANCH"
```

Prune and verify:

```bash
git fetch --all --prune
git status --short --branch
git branch -vv
git branch -r
git tag --list "v$VERSION"
git log --first-parent --oneline --decorate main --max-count=10
git log --graph --oneline --decorate --all --max-count=25
```

Use `git branch -D` only after confirming that the branch's commits are safely reachable from `development` or `main`.

## Agent guardrails

- Do not push feature work directly to `main`.
- Do not release an unchanged tree or ignore unexpected `main`/release-source divergence.
- Do not create a release branch unless release-specific work or stabilization requires it.
- Do not create release tags before the release source is merged into `main`.
- Do not publish `main` and its release tag with separate pushes.
- Do not force a sync-back merge; fast-forward `development` to released `main`.
- Do not delete feature/fix or release branches before confirming they are merged.
- When asked for commands only, do not execute them.
- When asked to execute the workflow, report the release source, release merge commit, annotated tag, atomic publication, fast-forward synchronization, and cleanup result.
