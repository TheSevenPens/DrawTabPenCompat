import { base } from '$app/paths';
import { getCompatibilityData } from '../../lib/compatibility-data-store.js';
import { getDisplayName } from '../../lib/device-display.js';
import { buildPenDetailHref } from '../../lib/pen-url.js';

export async function load({ fetch }) {
  const data = await getCompatibilityData(base, fetch);

  const uniquePenIds = new Set();
  for (const pair of data.pairs) {
    uniquePenIds.add(pair.penId);
  }

  const pens = Array.from(uniquePenIds)
    .map((id) => {
      const def = data.penDefs.get(id);
      const familyId = def?.familyId || '';
      const name = def?.name || id;
      const displayName = getDisplayName(id, name);
      const brand = def?.brand || '';
      return {
        id: displayName,
        name: displayName,
        brand,
        family: data.penFamilyDefs.get(familyId) || familyId || 'Unspecified',
        href: buildPenDetailHref(base, {
          id,
          brand,
          name: def?.name || id
        })
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  const brands = [...new Set(pens.map(p => p.brand))].filter(Boolean).sort();

  return { pens, brands };
}
