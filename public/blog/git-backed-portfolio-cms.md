# Why I built a Git-backed portfolio CMS

- Date: 2026-07-22
- Excerpt: The reasoning behind keeping this portfolio content in source files, then generating markdown mirrors for people and agents.
- Cover image: https://picsum.photos/seed/git-backed-portfolio-cms/1600/900.jpg

This portfolio uses source files as the content system. The main site copy lives in JSON. Blog posts live in markdown. A prebuild script generates public markdown mirrors, sitemap entries, and a small navigation skill for agents.

That sounds heavier than a normal portfolio until the site starts changing often. Then it helps.

## One source is easier to trust

Portfolio copy drifts fast. A project title changes in one card but not on the detail page. A resume line gets updated in markdown but not in the public page. A contact email changes in the footer and gets missed somewhere else.

The fix is not complicated. Keep the main content in one place, then render or generate the other surfaces from it.

## Markdown mirrors make the site easier to inspect

The visual site is for people. The markdown mirrors are for quick reading, search, and agent inspection. A person can browse the React routes. An agent can read `/llms-full.txt`, `/projects.md`, or an individual project markdown file without scraping layout.

That fits how I want the portfolio to work. It should be understandable without needing to inspect every component first.

## Git keeps changes reviewable

Because the content is in files, every rewrite shows up in a diff. That makes it easier to catch unsupported claims, stale project pages, and accidental placeholder text before the site ships.

It is not a fancy CMS. It is a small system that fits the way this site is maintained.
