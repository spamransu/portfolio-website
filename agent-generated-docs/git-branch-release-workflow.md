# Portfolio Website Git branch, release, and cleanup workflow

This repository follows the user's preferred Git pattern for projects with `development` as the integration branch and `main` as the production branch.

Use this workflow unless the user gives a different instruction in the current task.

## Branch model

```text
feat/* or fix/*
        |
        v
development
        |
        v
release/vX.Y.Z
        |
        v
main ---- annotated tag vX.Y.Z
  |
  +---- merged back into development
```

Core rules:

- Start feature and fix branches from `development`, not `main`.
- Keep work branches focused and short-lived.
- Use Conventional Commit-style messages for normal commits, for example `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`.
- Preserve branch history with merge commits. Do not squash or rebase merges unless the user explicitly asks.
- Cut `release/vX.Y.Z` from `development` after intended work is merged and validated.
- Merge release branches into `main` with `--no-ff` and a message shaped like `Merge branch 'release/vX.Y.Z'`.
- Create an annotated tag on the release merge commit in `main`.
- Merge `main` back into `development` after the release.
- Delete short-lived feature/fix and release branches only after verifying they are merged locally and remotely.

## Current baseline example

The first release created with this workflow in this repository was `v0.0.1` on August 3, 2026.

The sequence was:

1. `feat/blog-case-study-writing` contained the feature commit:
   - `bd2d673 feat(blog): add draft notes on case-study writing`
2. `feat/blog-case-study-writing` was merged into `development` with:
   - `c9d5c20 Merge branch 'feat/blog-case-study-writing' into development`
3. `release/v0.0.1` was cut from `development`.
4. `release/v0.0.1` was merged into `main` with:
   - `d9972e9 Merge branch 'release/v0.0.1'`
5. Annotated tag `v0.0.1` was created on `d9972e9`.
6. `main` was merged back into `development` with:
   - `bc87169 Merge branch 'main' into development`
7. The short-lived branches were deleted locally and remotely:
   - `feat/blog-case-study-writing`
   - `release/v0.0.1`

## 1. Orient before changing branches

Run this before creating, merging, releasing, or cleaning up branches:

```bash
git status --short --branch
git fetch --all --prune
git branch -vv
git branch -r
git tag --sort=-version:refname | head
```

Confirm:

- the working tree is clean or contains only expected changes
- `origin` is the expected remote
- `development` and `main` track their remote branches
- the target `release/vX.Y.Z` branch does not already exist
- the target `vX.Y.Z` tag does not already exist

## 2. Create a feature or fix branch

Use a descriptive branch name:

```bash
WORK_BRANCH="feat/descriptive-name"
```

Create it from an up-to-date `development` branch:

```bash
git switch development
git pull --ff-only origin development
git switch -c "$WORK_BRANCH"
git push -u origin "$WORK_BRANCH"
```

Commit focused changes on the work branch:

```bash
git status --short
git diff
git add <specific-files>
git diff --cached
git commit -m "feat: describe the completed change"
git push
```

Prefer `git add <specific-files>` over `git add .` when the working tree has unrelated or generated files.

## 3. Validate before merge

Use the checks relevant to the scope of the change.

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

Review the work branch before merging:

```bash
git log --oneline development..HEAD
git diff --stat development...HEAD
git status --short --branch
```

## 4. Merge the work branch into `development`

Preferred shape:

```bash
git switch development
git pull --ff-only origin development
git merge --no-ff "$WORK_BRANCH" -m "Merge branch '$WORK_BRANCH' into development"
git push origin development
```

If a pull request is used, target `development` and choose a merge commit. Do not choose squash or rebase merge unless the user explicitly asks.

## 5. Create a release branch

Set the version without the leading `v`:

```bash
VERSION="0.0.1"
RELEASE_BRANCH="release/v$VERSION"
```

Create the release branch from `development`:

```bash
git switch development
git pull --ff-only origin development
git switch -c "$RELEASE_BRANCH"
git push -u origin "$RELEASE_BRANCH"
```

Only release preparation and release-blocking fixes belong on a release branch. Do not add unrelated feature work there.

If release-only changes are needed:

```bash
git add <release-files>
git diff --cached
git commit -m "chore: prepare v$VERSION release"
git push
```

Do not create an empty release-preparation commit just to make the branch look active. The release merge commit is enough when no release-only file change is needed.

## 6. Merge release into `main` and tag it

Merge the release branch into `main` with a merge commit:

```bash
git switch main
git pull --ff-only origin main
git merge --no-ff "$RELEASE_BRANCH" -m "Merge branch '$RELEASE_BRANCH'"
git tag -a "v$VERSION" -m "v$VERSION"
```

Verify the tag points at the release merge commit:

```bash
git status --short --branch
git show --no-patch --decorate HEAD
git show --no-patch "v$VERSION"
git tag --points-at HEAD
git log --graph --oneline --decorate --max-count=20
```

Publish `main` and the tag:

```bash
git push origin main
git push origin "v$VERSION"
```

Do not rewrite or move a published release tag unless the user explicitly approves it.

## 7. Merge `main` back into `development`

After publishing the release, synchronize `development` with the released `main` history:

```bash
git switch development
git pull --ff-only origin development
git merge --no-ff main -m "Merge branch 'main' into development"
git push origin development
```

This keeps the release merge and tag ancestry visible from `development`.

## 8. Clean up short-lived branches

Only clean up after the release is merged, tagged, pushed, and synced back to `development`.

First verify merged state:

```bash
git switch development
git fetch --all --prune
git branch --merged development
git branch -r --merged origin/development
```

Delete local branches:

```bash
git branch -d "$RELEASE_BRANCH"
git branch -d "$WORK_BRANCH"
```

Delete remote branches:

```bash
git push origin --delete "$RELEASE_BRANCH"
git push origin --delete "$WORK_BRANCH"
```

Prune and verify:

```bash
git fetch --all --prune
git status --short --branch
git branch -vv
git branch -r
git log --graph --oneline --decorate --all --max-count=20
```

Use `git branch -D` only when you have already verified the branch is safely merged and Git is refusing deletion because of local ancestry bookkeeping.

## 9. Complete copy-paste skeleton

```bash
VERSION="0.0.1"
WORK_BRANCH="feat/descriptive-name"
RELEASE_BRANCH="release/v$VERSION"

# feature or fix branch
git switch development
git pull --ff-only origin development
git switch -c "$WORK_BRANCH"
git push -u origin "$WORK_BRANCH"

# after work is committed and pushed
git switch development
git pull --ff-only origin development
git merge --no-ff "$WORK_BRANCH" -m "Merge branch '$WORK_BRANCH' into development"
git push origin development

# release branch
git switch development
git pull --ff-only origin development
git switch -c "$RELEASE_BRANCH"
git push -u origin "$RELEASE_BRANCH"

# release merge and tag
git switch main
git pull --ff-only origin main
git merge --no-ff "$RELEASE_BRANCH" -m "Merge branch '$RELEASE_BRANCH'"
git tag -a "v$VERSION" -m "v$VERSION"
git push origin main
git push origin "v$VERSION"

# sync back
git switch development
git pull --ff-only origin development
git merge --no-ff main -m "Merge branch 'main' into development"
git push origin development

# cleanup after verifying merge state
git fetch --all --prune
git branch --merged development
git branch -r --merged origin/development
git branch -d "$RELEASE_BRANCH"
git branch -d "$WORK_BRANCH"
git push origin --delete "$RELEASE_BRANCH"
git push origin --delete "$WORK_BRANCH"
git fetch --all --prune
```

## Agent guardrails

- Do not push directly to `main` for feature work.
- Do not create release tags before the release branch is merged into `main`.
- Do not leave local `main` ahead of `origin/main` with feature commits outside the release path.
- Do not delete feature/fix or release branches before confirming they are merged.
- When asked for commands only, do not execute them.
- When asked to execute the workflow, report the exact branches, merge commits, tag, and cleanup result.
