# Git-backed portfolio content system

- Year: 2026
- Client: Personal portfolio
- Role: Frontend developer
- Stack: React, TypeScript, JSON content, Markdown, Cloudflare Pages, Vite
- Homepage image: https://384721.xyz/images/home/featured-project-4.png

## Summary
The content system behind this site, with JSON as the source of truth, generated markdown mirrors, blog files, project pages, and Cloudflare Pages support.

## Overview
A Git-backed content architecture that keeps this portfolio editable from one JSON source while publishing readable React routes and markdown mirrors. A portfolio gets messy when page copy, case studies, markdown files, and machine-readable indexes all drift apart. This build treats content as the source, then generates the files other surfaces need.

## Challenge
The site needed to work as a human portfolio and as a machine-readable content source without keeping duplicate copy in separate places.

## Approach
The React routes read from the same JSON content used by the generation script. Blog posts stay in markdown. The prebuild step writes public markdown pages, indexes, sitemap entries, and the site navigation skill.

- Kept main site copy in content/site-content.json.
- Generated markdown mirrors for pages, projects, resume, blog, and LLM-friendly indexes.
- Rendered public React routes from shared content instead of hardcoded page copy.
- Used Cloudflare Pages functions to serve markdown when requested.

## Result
The site stays easier to update because the copy has one main home. It also gives agents and readers a cleaner way to understand the site through markdown mirrors.

- The portfolio can be edited from one content source and still publish readable markdown mirrors.
- The site is easier for humans and agents to inspect without scraping visual pages.
- Future case studies and posts have a clearer source path.

## Project scope
- Git-backed CMS
- Content Architecture
- Markdown Generation
- Cloudflare Pages Functions
- React Content Rendering

## Reflection
A portfolio content system earns its keep when the same source can serve visitors, editors, and agents without duplicate copy drifting apart.
