---
title: "Lightweight Git-backed portfolio CMS"
slug: "lightweight-git-backed-portfolio-cms"
date: "2026-07-22"
status: "published"
coverImage: "/images/home/featured-project-1.png"
coverAlt: "Mock admin dashboard panels beside a Git commit log and content editor."
excerpt: "Why the portfolio admin is being built around GitHub, Cloudflare Pages Functions, and structured content files instead of a database CMS."
---

A portfolio does not need a heavy CMS just to edit a few durable content types.

The better fit here is a small admin layer that writes back to the repository, keeps content reviewable in Git, and still deploys through the existing Cloudflare Pages pipeline.

## Why this direction

- The site already treats structured content files as the source of truth.
- Git history is enough for audit, rollback, and change review.
- Cloudflare Pages Functions can proxy the authenticated write flow without exposing a token to the browser.

## What this unlocks

The admin app can stay focused on the actual editing surfaces: site settings, projects, blog posts, and media references. It does not need roles, workflow engines, or a separate database layer to ship useful updates.
