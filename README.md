# Portfolio Website

React + TypeScript + SCSS + pnpm starter for a case-study portfolio.

## What is included

- Standard pages: About, Projects, Contact, CV / Resume
- Case-study project detail routes
- Content source of truth in `/content/site-content.json`
- Generated machine-readable assets:
  - `/llms.txt`
  - `/llms-full.txt`
  - `/sitemap.xml`
  - markdown mirrors like `/about.md` and `/projects/<slug>.md`
  - `/.well-known/agent-skills/index.json`
- Cloudflare Pages-friendly `_headers`, `_redirects`, and a Pages Function for `Accept: text/markdown`

## Stack

- React 19
- TypeScript
- SCSS
- Vite
- pnpm

## Start

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Content editing

Update `/home/ransu/codex-projects/portfolio-website/content/site-content.json`.

Then regenerate the machine-readable assets:

```bash
pnpm run prebuild
```

`pnpm dev` and `pnpm build` already run that step automatically.

## Deployment notes

For a real domain, set `SITE_URL` before building so these files use the final URL:

```bash
SITE_URL=https://your-domain.com pnpm build
```

Optional env vars:

- `CONTACT_EMAIL`
- `CONTACT_LOCATION`

If you deploy to Cloudflare Pages, this repo already includes:

- `_headers` for link discovery and content signals
- `_redirects` for SPA routing
- `functions/[[path]].ts` so agents requesting `Accept: text/markdown` can receive markdown mirrors

## Agent-friendly surfaces

This repo is designed so agents can understand the site without reverse-engineering the UI.

Primary entry points:

- `/llms.txt`
- `/llms-full.txt`
- `/.well-known/agent-skills/index.json`
- page-level markdown mirrors
