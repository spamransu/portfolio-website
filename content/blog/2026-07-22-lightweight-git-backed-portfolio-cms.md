---
title: "Why this portfolio uses a Git-backed content system"
slug: "git-backed-portfolio-cms"
date: "2026-07-22"
status: "published"
excerpt: "How JSON and Markdown keep the portfolio's visible pages, mirrors, and project notes in sync."
coverImage: "https://picsum.photos/seed/git-backed-portfolio-cms/1600/900.jpg"
coverAlt: "File editor beside a notebook, used as a placeholder cover for a note about the portfolio content system."
---
This portfolio keeps its editable content in the repository. Site copy lives in JSON. Notes live in Markdown. A prebuild script generates the public mirrors, sitemap entries, and agent-readable navigation files.

That is more deliberate than a tiny hosted CMS, but it solves a real problem: portfolio copy changes in several places unless one source owns it.

## One source prevents drift

A project title can change in a card, a detail page, and a resume entry. A contact address can be correct in the footer and stale in a generated page. Editing each copy by hand is an invitation to miss one.

The content file is the source of truth. React pages read from it, and the prebuild script creates the derived Markdown and metadata files. The generated files are outputs, not a second place to edit.

## Markdown mirrors make the site inspectable

The visual routes are for people. Files such as `/llms-full.txt`, `/projects.md`, and the individual project pages make the same material quick to read, search, or inspect without scraping layout.

That is useful for accessibility, search, and agents. It also makes a content review a file review instead of a tour through every component.

## Git keeps the rewrite visible

When the content is in files, a rewrite appears in a diff. I can review changed claims, spot placeholder text, and see whether a project page was updated everywhere before building.

It is not a general-purpose CMS. It is a small content workflow that matches how this portfolio is maintained.
