import { base } from '$app/paths';
import { getCompatibilityData } from '../../lib/compatibility-data-store.js';
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
      return {
        id,
        name: def?.name || id,
        family: data.penFamilyDefs.get(familyId) || familyId || 'Unspecified',
        href: buildPenDetailHref(base, {
          id,
          brand: def?.brand || '',
          name: def?.name || id
        })
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return { pens };
}
