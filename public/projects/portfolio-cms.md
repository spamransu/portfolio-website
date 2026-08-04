# Git-backed portfolio content system

- Year: 2026
- Client: Personal portfolio
- Role: Frontend developer
- Stack: React, TypeScript, JSON content, Markdown, Cloudflare Pages, Vite
- Homepage image: https://384721.xyz/images/home/featured-project-4.png

## Summary
The content system behind this site, with JSON as the source of truth, generated markdown mirrors, blog files, project pages, and Cloudflare Pages support.

## Challenge
The site needed to work as a human portfolio and as a machine-readable content source without keeping duplicate copy in separate places.

## Approach
- Kept main site copy in content/site-content.json.
- Generated markdown mirrors for pages, projects, resume, blog, and LLM-friendly indexes.
- Rendered public React routes from shared content instead of hardcoded page copy.
- Used Cloudflare Pages functions to serve markdown when requested.

## Outcome
- The portfolio can be edited from one content source and still publish readable markdown mirrors.
- The site is easier for humans and agents to inspect without scraping visual pages.
- Future case studies and posts have a clearer source path.
