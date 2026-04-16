/**
 * Generates the three JSON files in static/data/ from DrawTabData submodule.
 * Loads all brands (Wacom, Huion, XP-Pen, Ugee, Xencelabs, Samsung).
 * Run: node scripts/generate-data.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

mkdirSync('static/data', { recursive: true });

const DATA_DIR = 'data-repo/data';

function loadJSON(path) {
  let text = readFileSync(path, 'utf-8');
  // Strip BOM if present
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  return JSON.parse(text);
}

function tryLoadJSON(path) {
  if (!existsSync(path)) return null;
  return loadJSON(path);
}

// --- Brand configuration ---
// Matches BRAND_NAMES from data-repo/lib/drawtab-loader.ts
const BRAND_DISPLAY_NAMES = {
  WACOM: "Wacom", HUION: "Huion", XPPEN: "XP-Pen",
  UGEE: "Ugee", XENCELABS: "Xencelabs", SAMSUNG: "Samsung",
};

function brandDisplayName(prefix) {
  return BRAND_DISPLAY_NAMES[prefix] ?? prefix;
}

// File prefix -> brand id used in the app
const BRANDS = [
  { prefix: 'WACOM',     brandId: 'wacom' },
  { prefix: 'HUION',     brandId: 'huion' },
  { prefix: 'XPPEN',     brandId: 'xppen' },
  { prefix: 'UGEE',      brandId: 'ugee' },
  { prefix: 'XENCELABS', brandId: 'xencelabs' },
  { prefix: 'SAMSUNG',   brandId: 'samsung' },
];

const allPenFamilyDefs = [];
const allPenDefs = [];
const allTabletFamilyDefs = [];
const allTabletDefs = [];
const allCompatRows = [];

for (const { prefix, brandId } of BRANDS) {
  // --- Pens ---
  const pensData = tryLoadJSON(`${DATA_DIR}/pens/${prefix}-pens.json`);
  if (pensData?.Pens) {
    const bdn = brandDisplayName(prefix);
    for (const p of pensData.Pens) {
      // FullName logic from data-repo pen-fields.ts
      const penFullName = p.PenName === p.PenId
        ? `${bdn} ${p.PenId}`
        : `${bdn} ${p.PenName} (${p.PenId})`;
      allPenDefs.push({
        brand: brandId,
        familyid: p.PenFamily || "",
        id: p.PenId,
        name: p.PenName,
        fullname: penFullName,
        year: p.PenYear || "",
      });
    }
  }

  // --- Pen families ---
  const penFamiliesData = tryLoadJSON(`${DATA_DIR}/pen-families/${prefix}-pen-families.json`);
  if (penFamiliesData?.PenFamilies) {
    for (const f of penFamiliesData.PenFamilies) {
      allPenFamilyDefs.push({
        brand: brandId,
        id: f.FamilyId,
        name: f.FamilyName,
      });
    }
  }

  // --- Tablets ---
  const tabletsData = tryLoadJSON(`${DATA_DIR}/tablets/${prefix}-tablets.json`);
  if (tabletsData?.DrawingTablets) {
    const bdn = brandDisplayName(prefix);
    for (const t of tabletsData.DrawingTablets) {
      const id = t.Model ? t.Model.Id : t.ModelId;
      const name = t.Model ? t.Model.Name : t.ModelName;
      // FullName logic from data-repo tablet-fields.ts
      const tabletFullName = `${bdn} ${name} (${id})`;
      allTabletDefs.push({
        brand: brandId,
        familyid: (t.Model ? t.Model.Family : t.ModelFamily) || "",
        id,
        name,
        fullname: tabletFullName,
        type: ((t.Model ? t.Model.Type : t.ModelType) || "pentablet").toLowerCase(),
      });
    }
  }

  // --- Tablet families ---
  const tabletFamiliesData = tryLoadJSON(`${DATA_DIR}/tablet-families/${prefix}-tablet-families.json`);
  if (tabletFamiliesData?.TabletFamilies) {
    for (const f of tabletFamiliesData.TabletFamilies) {
      allTabletFamilyDefs.push({
        brand: brandId,
        id: f.FamilyId,
        name: f.FamilyName,
      });
    }
  }

  // --- Pen compatibility ---
  const compatData = tryLoadJSON(`${DATA_DIR}/pen-compat/${prefix}-pen-compat.json`);
  if (compatData?.PenCompat) {
    for (const entry of compatData.PenCompat) {
      allCompatRows.push({
        tablets: entry.TabletIds,
        pens: [entry.PenId],
      });
    }
  }
}

// --- Write output files (keep same names for backward compat) ---

const pensOutput = {
  penfamilydefs: allPenFamilyDefs,
  pendefs: allPenDefs,
};
writeFileSync('static/data/wacom-pens.json', JSON.stringify(pensOutput, null, 4));
console.log(`wacom-pens.json: ${pensOutput.penfamilydefs.length} families, ${pensOutput.pendefs.length} pens`);

const tabletsOutput = {
  tabletfamilydefs: allTabletFamilyDefs,
  tabletdefs: allTabletDefs,
};
writeFileSync('static/data/wacom-tablets.json', JSON.stringify(tabletsOutput, null, 4));
console.log(`wacom-tablets.json: ${tabletsOutput.tabletfamilydefs.length} families, ${tabletsOutput.tabletdefs.length} tablets`);

const compatOutput = {
  compatrows: allCompatRows,
};
writeFileSync('static/data/wacom-pen-compat.json', JSON.stringify(compatOutput, null, 4));
console.log(`wacom-pen-compat.json: ${compatOutput.compatrows.length} compat rows`);

// --- Summary by brand ---
const brandPenCounts = {};
const brandTabletCounts = {};
allPenDefs.forEach(p => { brandPenCounts[p.brand] = (brandPenCounts[p.brand] || 0) + 1; });
allTabletDefs.forEach(t => { brandTabletCounts[t.brand] = (brandTabletCounts[t.brand] || 0) + 1; });
console.log('\nBrand summary:');
for (const { brandId } of BRANDS) {
  const pens = brandPenCounts[brandId] || 0;
  const tablets = brandTabletCounts[brandId] || 0;
  if (pens || tablets) console.log(`  ${brandId}: ${pens} pens, ${tablets} tablets`);
}

console.log('\nDone. Generated static/data/ from data-repo/.');
