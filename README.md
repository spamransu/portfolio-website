# Lance Carteciano — Portfolio Website

A case-study portfolio for Lance Carteciano, built with React, TypeScript, SCSS, and Vite. The site presents frontend, WordPress, and design-to-code work through reusable pages and project detail routes.

## Project status

This is a private, actively developed portfolio project (`package.json` sets version `0.1.0`).

## Features

- Home, About, Blog, Projects, Contact, Resume, and Design System pages
- Individual case-study routes for each project
- Content-first architecture: `/content/site-content.json` is the editable source of truth
- Published blog posts sourced from `/content/blog/*.md`
- Generated markdown mirrors and agent-readable metadata:
  - `/public/*.md` and `/public/projects/*.md`
  - `/public/llms.txt` and `/public/llms-full.txt`
  - `/public/sitemap.xml`
  - `/public/.well-known/agent-skills/site-navigation/index.json`
- Cloudflare Pages support through `wrangler.toml`, `_headers`, `_redirects`, and `functions/[[path]].ts`
- Optional GitHub-backed admin/CMS application at `/admin/`

## Stack

- React 19 and React Router 7
- TypeScript 5.8
- Vite 7
- SCSS (Sass)
- GSAP for motion
- pnpm

## Requirements

- Node.js compatible with the versions required by the dependencies in `package.json`
- pnpm

## Install and run locally

```bash
pnpm install
pnpm dev
```

Vite serves the site at [http://localhost:4173](http://localhost:4173). The `dev` script regenerates the machine-readable files before starting the server.

To preview a production build locally:

```bash
pnpm build
pnpm preview
```

## Common commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Generate content mirrors and start the Vite development server |
| `pnpm build` | Generate content mirrors, type-check, and create the production build in `dist/` |
| `pnpm preview` | Serve the existing production build locally |
| `pnpm run prebuild` | Regenerate markdown mirrors, sitemap, and agent metadata |
| `pnpm lint` | Run ESLint |
| `pnpm lint:oxlint` | Run Oxlint |
| `pnpm lint:colors` | Check color-token usage |
| `pnpm test` | Run the Vitest test suite once |

## Editing content

1. Edit [`content/site-content.json`](content/site-content.json).
2. For blog posts, add or update Markdown files in [`content/blog/`](content/blog/). Published posts require frontmatter with `status: published`; draft posts are excluded from generated output.
3. Regenerate the derived files:

   ```bash
   pnpm run prebuild
   ```

`pnpm dev` and `pnpm build` run this step automatically. Generated files are written to `public/` and should not be edited directly.

## Environment variables

Copy `.env.example` to `.env` when you need local values:

```bash
cp .env.example .env
```

| Variable | Used for |
| --- | --- |
| `SITE_URL` | Canonical URL in generated links and the sitemap |
| `CONTACT_EMAIL` | Generated contact-page email override |
| `CONTACT_LOCATION` | Generated contact-page location override |
| `GITHUB_CLIENT_ID` | GitHub OAuth for the admin/CMS function |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth for the admin/CMS function |
| `ADMIN_ALLOWED_GITHUB_LOGIN` | GitHub login allowed to use the CMS |
| `ADMIN_SESSION_SECRET` | Session signing for the CMS |
| `GITHUB_OWNER` | Repository owner used by the CMS |
| `GITHUB_REPO` | Repository used by the CMS |
| `CMS_TARGET_BRANCH` | Branch targeted by CMS changes (defaults to `main` when unset) |

Do not commit real credentials or session secrets. The checked-in `.env.example` contains placeholders only.

For a canonical production URL, set `SITE_URL` before building:

```bash
SITE_URL=https://your-domain.example pnpm build
```

## Cloudflare Pages

The repository is configured for a Cloudflare Pages build output of `dist/` (`wrangler.toml`). Set the production environment variables in the Pages project rather than committing them. The Pages Function serves markdown when a request includes `Accept: text/markdown` and handles the optional admin/CMS API routes.

## Repository layout

```text
content/       Editable site and blog content
public/        Generated markdown, metadata, and static assets
src/           Public React application and SCSS
admin/         Optional CMS React application
functions/     Cloudflare Pages Function
scripts/       Content and agent-file generation scripts
```

## License

No license file is currently included. All rights remain with the project owner unless a separate written agreement states otherwise.
