# Architecture

## Tech stack

- **SvelteKit** (Svelte 5) with static adapter
- **Vite** for dev server and build
- No CSS framework; plain CSS with global styles in `src/app.css`

## Data flow

```
DrawTabData submodule (data-repo/)
        |
        | node scripts/generate-data.js  (runs at build time)
        v
static/data/wacom-pens.json
static/data/wacom-tablets.json
static/data/wacom-pen-compat.json
        |
        | fetched at runtime by SvelteKit
        v
src/lib/data-loader.js        -- parses JSON into Maps
src/lib/compatibility-data-store.js  -- caches parsed data
        |
        v
Page loaders (+page.js)        -- shape data for each route
Components (+page.svelte)      -- render UI
```

Note: the output files are named `wacom-*.json` for historical reasons but contain data from all brands.

## Data repository (DrawTabData)

The [DrawTabData](https://github.com/TheSevenPens/DrawTabData) repo is included as a git submodule at `data-repo/`. It contains:

```
data-repo/data/
  pens/           {BRAND}-pens.json         -- pen definitions
  tablets/        {BRAND}-tablets.json       -- tablet definitions (nested schema)
  pen-families/   {BRAND}-pen-families.json  -- pen family groupings
  tablet-families/{BRAND}-tablet-families.json
  pen-compat/     {BRAND}-pen-compat.json   -- which pens work with which tablets
```

Brands: `WACOM`, `HUION`, `XPPEN`, `UGEE`, `XENCELABS`, `SAMSUNG`.

The tablet schema uses a nested structure (`Model.Id`, `Model.Name`, `Model.Family`, `Model.Type`, etc.). Pen data uses a flat structure (`PenId`, `PenName`, `PenFamily`, etc.).

### Updating data

```sh
git submodule update --remote data-repo
node scripts/generate-data.js
```

## Generate script

`scripts/generate-data.js` iterates over all brands and produces three combined JSON files:

- **wacom-pens.json** - All pen definitions and pen family definitions across brands
- **wacom-tablets.json** - All tablet definitions and tablet family definitions across brands
- **wacom-pen-compat.json** - All compatibility rows (pen -> tablet mappings)

The script handles BOM-encoded files and supports both the legacy flat tablet schema and the current nested schema.

## Source layout

```
src/
  app.css                    -- global styles
  app.html                   -- HTML shell
  lib/
    data-loader.js           -- fetches and parses the three JSON files
    compatibility-data-store.js -- singleton cache for parsed data
    device-display.js        -- display name formatting
    device-search.js         -- search/filter logic
    pen-url.js               -- URL builders for pen routes
    tablet-url.js            -- URL builders for tablet routes
  components/
    Controls.svelte          -- search input, brand filter, group-by dropdown
    CompatTable.svelte       -- compatibility pair table with search and brand filter
    DeviceTable.svelte       -- generic device list table
    DisclaimerBanner.svelte  -- data accuracy disclaimer
    CopyButton.svelte        -- copy-to-clipboard button
  routes/
    +layout.js               -- preloads compatibility data
    +layout.svelte            -- nav bar
    +page.svelte              -- home page
    pencompat/                -- browse compatibility pairs
    tablets/                  -- tablet list and detail pages
    pens/                     -- pen list and detail pages
    tabletfamilies/           -- tablet family list and detail pages
    penfamilies/              -- pen family list and detail pages
    log/                      -- data quality diagnostics
```

## Related projects

- **[DrawTabData](https://github.com/TheSevenPens/DrawTabData)** - The source data repo. This project consumes it as a submodule. Changes to data schema or structure in DrawTabData may require updates to `scripts/generate-data.js` and `src/lib/data-loader.js`.

- **[DrawTabDataExplorer](https://github.com/TheSevenPens/DrawTabDataExplorer)** - A more comprehensive UI for navigating DrawTabData. It provides richer browsing, detail views, and data exploration features. When considering new features or UI patterns for DrawTabPenCompat, DrawTabDataExplorer is a useful reference for what a fuller implementation looks like.

## Static output

The build produces a fully static site in `dist/` via `@sveltejs/adapter-static`. All routes are prerendered. The JSON data files are included as static assets.
