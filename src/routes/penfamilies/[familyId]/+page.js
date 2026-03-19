import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { getCompatibilityData } from '../../../lib/compatibility-data-store.js';
import { buildPenDetailHref } from '../../../lib/pen-url.js';

export async function load({ fetch, params }) {
  const data = await getCompatibilityData(base, fetch);
  const familyId = decodeURIComponent(params.familyId);
  const familyName = data.penFamilyDefs.get(familyId);

  if (!familyName) {
    throw error(404, `Unknown pen family: ${familyId}`);
  }

  const pens = Array.from(data.penDefs.entries())
    .filter(([, def]) => def.familyId === familyId)
    .map(([id, def]) => ({
      id,
      name: def.name || id,
      family: familyName,
      href: buildPenDetailHref(base, {
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
    pens
  };
}
