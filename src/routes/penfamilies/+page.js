import { base } from '$app/paths';
import { getCompatibilityData } from '../../lib/compatibility-data-store.js';

export async function load({ fetch }) {
  const data = await getCompatibilityData(base, fetch);
  const penCountsByFamily = new Map();

  data.penDefs.forEach((def) => {
    if (!def.familyId) return;
    penCountsByFamily.set(def.familyId, (penCountsByFamily.get(def.familyId) || 0) + 1);
  });

  const families = Array.from(data.penFamilyDefs.entries())
    .map(([id, name]) => {
      const count = penCountsByFamily.get(id) || 0;
      const brand = data.penFamilyBrands?.get(id) || '';
      return {
        id: name,
        name,
        brand,
        family: `${count} pens`,
        href: `${base}/penfamilies/${encodeURIComponent(id)}/`
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  const brands = [...new Set(families.map(f => f.brand))].filter(Boolean).sort();

  return { families, brands };
}
