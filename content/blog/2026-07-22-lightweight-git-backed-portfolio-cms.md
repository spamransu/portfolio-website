---
title: "Why this portfolio uses a Git-backed content system"
slug: "git-backed-portfolio-cms"
date: "2026-07-22"
status: "published"
excerpt: "How JSON and Markdown keep the portfolio's visible pages, mirrors, and project notes in sync."
coverImage: "https://picsum.photos/seed/git-backed-portfolio-cms/1600/900.jpg"
coverAlt: "File editor beside a notebook, used as a placeholder cover for a note about the portfolio content system."
---
This portfolio keeps its editable content in the repository. Site copy lives in JSON. Blog and project notes live in Markdown. A prebuild script generates the public mirrors, sitemap entries, and agent-readable navigation files.

That is more deliberate than a tiny hosted CMS, but it solves a real problem: portfolio copy changes in several places unless one source owns it.

## One source prevents drift

A project title can appear in a card, a detail page, a project index, and a resume entry. A contact address can be correct in the footer and stale in a generated page. Editing each copy by hand makes it easy to miss one.

The editable content file is the source of truth. React pages read from it, and the prebuild script creates derived Markdown and metadata files. Generated files are outputs, not a second place to edit.

This arrangement also gives each change a visible diff. A reviewer can see whether a title, description, or link changed without comparing screenshots manually.

## Markdown mirrors make the site inspectable

The visual routes are for people. Files such as `/llms-full.txt`, `/projects.md`, and individual project pages expose the same material in a form that is quick to read, search, or inspect without scraping layout.

The mirrors support accessibility, search, and agent workflows. They also make content review a file review. If a claim is outdated, the source file and its generated copies have a predictable relationship.

The generated files should not be edited directly. The next prebuild can replace them, so a direct change would be temporary and easy to lose.

## Git keeps the rewrite visible

When content is stored in files, a rewrite appears in a diff. I can review changed claims, spot placeholder text, and see whether a project page was updated everywhere before building.

Git also preserves the history of those edits. A future maintainer can identify when a description changed, which files changed together, and whether the update was content-only or part of a structural change.

For this workflow, a focused content commit can be validated with `pnpm run prebuild`. A structural change also runs `pnpm build`, and rendered changes get a browser check.

## This is not a general-purpose CMS

The system does not provide every feature of a hosted CMS. It favors a small set of files, predictable generation, and reviewable changes.

That trade-off fits a portfolio that is edited by its developer. The content remains portable, the outputs can be regenerated, and a rewrite does not disappear inside an opaque admin interface.
