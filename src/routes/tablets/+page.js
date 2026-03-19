import { base } from '$app/paths';
import { getCompatibilityData } from '../../lib/compatibility-data-store.js';
import { buildTabletDetailHref } from '../../lib/tablet-url.js';

export async function load({ fetch }) {
  const data = await getCompatibilityData(base, fetch);

  const uniqueTabletIds = new Set();
  for (const pair of data.pairs) {
    uniqueTabletIds.add(pair.tabletId);
  }

  const tablets = Array.from(uniqueTabletIds)
    .map((id) => {
      const def = data.tabletDefs.get(id);
      const familyId = def?.familyId || '';
      return {
        id,
        name: def?.name || id,
        family: data.tabletFamilyDefs.get(familyId) || familyId || 'Unspecified',
        href: buildTabletDetailHref(base, {
          id,
          brand: def?.brand || '',
          name: def?.name || id
        })
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return { tablets };
}
