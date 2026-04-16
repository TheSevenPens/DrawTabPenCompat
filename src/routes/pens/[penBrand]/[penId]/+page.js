import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { getCompatibilityData } from '../../../../lib/compatibility-data-store.js';
import { buildTabletDetailHref } from '../../../../lib/tablet-url.js';

export async function load({ fetch, params }) {
  const data = await getCompatibilityData(base, fetch);
  const penId = decodeURIComponent(params.penId);
  const penDef = data.penDefs.get(penId);

  if (!penDef) {
    throw error(404, `Unknown pen: ${penId}`);
  }

  const familyId = penDef.familyId || '';
  const uniqueTabletIds = new Set();
  for (const pair of data.pairs) {
    if (pair.penId === penId) {
      uniqueTabletIds.add(pair.tabletId);
    }
  }

  const tablets = Array.from(uniqueTabletIds)
    .map((id) => {
      const def = data.tabletDefs.get(id);
      const tabletFamilyId = def?.familyId || '';
      return {
        id,
        name: def?.fullName || def?.name || id,
        family: data.tabletFamilyDefs.get(tabletFamilyId) || tabletFamilyId || 'Unspecified',
        href: buildTabletDetailHref(base, {
          id,
          brand: def?.brand || '',
          name: def?.name || id
        })
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return {
    pen: {
      id: penId,
      name: penDef.fullName || penDef.name || penId,
      family: data.penFamilyDefs.get(familyId) || familyId || 'Unspecified'
    },
    tablets
  };
}
