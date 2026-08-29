# Debase browser-local Base64 tools

- Year: 2026
- Client: Personal project
- Role: Frontend developer
- Stack: React, TypeScript, Vite, SCSS, Vitest, Playwright
- Homepage image: https://384721.xyz/images/projects/debase-live-homepage.png

## Summary
A browser tool for encoding and decoding text and files as Base64, Base64URL, or Data URLs. The data stays on the device.

## Overview
Debase is a browser tool for encoding and decoding text or files. It supports Base64, Base64URL, and Data URLs, and keeps the payload on the device.

## Challenge
The utility needed to handle text and binary files locally, reject malformed encoded input clearly, and preview safe output without turning decoded active content into a browser security risk.

## Approach
I treated privacy and safe output handling as product requirements. The app validates input, limits raw files to 25 MiB, and only previews allowlisted images or bounded plain text.

- Built encode and decode flows for standard Base64, unpadded Base64URL, and Base64 Data URLs.
- Kept payload text, output, decoded bytes, filenames, MIME details, and file sizes inside the browser.
- Added strict validation, a 25 MiB raw-file limit, drag-and-drop, copy, swap, file picking, and downloads.
- Limited inline previews to allowlisted raster images and bounded plain text while keeping active content download-only.
- Covered the transformation logic and interface with Vitest, Testing Library, and Playwright.

## Result
Debase is live with a public TypeScript repository and automated unit, component, and end-to-end tests.

- The live tool handles common text and file transformations without sending payload data to a server.
- Clear validation and constrained previews make malformed or potentially active decoded content safer to handle.
- The public repository documents the privacy boundary, size limit, deployment path, and verification commands.

## Project scope
- Browser-local File Processing
- Base64 and Base64URL
- Data URL Handling
- Safe Output Previews
- Automated Testing

## Reflection
Small utilities become more trustworthy when their privacy boundary, validation behavior, content limits, and unsafe-output handling are explicit in both the interface and the codebase.
