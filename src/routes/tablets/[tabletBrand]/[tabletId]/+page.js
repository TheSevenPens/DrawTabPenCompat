import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { getCompatibilityData } from '../../../../lib/compatibility-data-store.js';
import { buildPenDetailHref } from '../../../../lib/pen-url.js';
import { getDisplayName } from '../../../../lib/device-display.js';

export async function load({ fetch, params }) {
  const data = await getCompatibilityData(base, fetch);
  const tabletId = decodeURIComponent(params.tabletId);
  const tabletDef = data.tabletDefs.get(tabletId);

  if (!tabletDef) {
    throw error(404, `Unknown tablet: ${tabletId}`);
  }

  const familyId = tabletDef.familyId || '';
  const uniquePenIds = new Set();
  for (const pair of data.pairs) {
    if (pair.tabletId === tabletId) {
      uniquePenIds.add(pair.penId);
    }
  }

  const pens = Array.from(uniquePenIds)
    .map((id) => {
      const def = data.penDefs.get(id);
      const penFamilyId = def?.familyId || '';
      const name = def?.name || id;
      const displayName = getDisplayName(id, name);
      return {
        id: displayName,
        name: displayName,
        family: data.penFamilyDefs.get(penFamilyId) || penFamilyId || 'Unspecified',
        href: buildPenDetailHref(base, {
          id,
          brand: def?.brand || '',
          name: def?.name || id
        })
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return {
    tablet: {
      id: tabletId,
      name: tabletDef.name || tabletId,
      family: data.tabletFamilyDefs.get(familyId) || familyId || 'Unspecified'
    },
    pens
  };
}
