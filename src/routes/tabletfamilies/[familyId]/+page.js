import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { getCompatibilityData } from '../../../lib/compatibility-data-store.js';
import { buildTabletDetailHref } from '../../../lib/tablet-url.js';

export async function load({ fetch, params }) {
  const data = await getCompatibilityData(base, fetch);
  const familyId = decodeURIComponent(params.familyId);
  const familyName = data.tabletFamilyDefs.get(familyId);

  if (!familyName) {
    throw error(404, `Unknown tablet family: ${familyId}`);
  }

  const tablets = Array.from(data.tabletDefs.entries())
    .filter(([, def]) => def.familyId === familyId)
    .map(([id, def]) => ({
      id,
      name: def.fullName || def.name || id,
      family: familyName,
      href: buildTabletDetailHref(base, {
        id,
        brand: def.brand || '',
        name: def.name || id
      })
    }))
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return {
    family: {
      id: familyId,
      name: familyName
    },
    tablets
  };
}
