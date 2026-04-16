# Overview

DrawTabPenCompat is a static web app that shows which pens are compatible with which drawing tablets. It covers multiple brands including Wacom, Huion, XP-Pen, Ugee, Xencelabs, and Samsung.

## What it does

- Browse all known pen-tablet compatibility pairs
- Browse and search tablets, pens, tablet families, and pen families
- Filter by brand
- Group by brand or family
- View detail pages for individual pens and tablets showing their compatible counterparts
- Copy device details to clipboard

## How it works

At build time, a generate script reads structured JSON from the [DrawTabData](https://github.com/TheSevenPens/DrawTabData) submodule and produces three combined JSON files. The SvelteKit app loads these at runtime and renders the UI.

The site is statically generated via `@sveltejs/adapter-static` and deployed as a GitHub Pages site.

## Pages

| Route | Purpose |
|---|---|
| `/` | Home with navigation cards |
| `/pencompat/` | Browse all compatibility pairs |
| `/tablets/` | Browse tablets (filter by brand, group by brand/family) |
| `/pens/` | Browse pens (filter by brand, group by brand/family) |
| `/tabletfamilies/` | Browse tablet families |
| `/penfamilies/` | Browse pen families |
| `/tablets/[brand]/[id]/` | Tablet detail with compatible pens |
| `/pens/[brand]/[id]/` | Pen detail with compatible tablets |
| `/tabletfamilies/[familyId]/` | Tablet family detail |
| `/penfamilies/[familyId]/` | Pen family detail |
| `/log/` | Data quality diagnostics |

## Related projects

- **[DrawTabData](https://github.com/TheSevenPens/DrawTabData)** - The upstream data repository (included as a git submodule). Contains all pen, tablet, family, and compatibility definitions in structured JSON.
- **[DrawTabDataExplorer](https://github.com/TheSevenPens/DrawTabDataExplorer)** - A more comprehensive UI for navigating DrawTabData. It offers richer browsing, filtering, and detail views. DrawTabPenCompat may reference DrawTabDataExplorer for feature parity or design decisions.
