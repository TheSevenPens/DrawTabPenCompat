import { base } from '$app/paths';
import { getCompatibilityData } from '../../lib/compatibility-data-store.js';

export async function load({ fetch }) {
  const data = await getCompatibilityData(base, fetch);
  const tabletCountsByFamily = new Map();

  data.tabletDefs.forEach((def) => {
    if (!def.familyId) return;
    tabletCountsByFamily.set(def.familyId, (tabletCountsByFamily.get(def.familyId) || 0) + 1);
  });

  const families = Array.from(data.tabletFamilyDefs.entries())
    .map(([id, name]) => {
      const count = tabletCountsByFamily.get(id) || 0;
      return {
        id: name,
        name,
        family: `${count} tablets`,
        href: `${base}/tabletfamilies/${encodeURIComponent(id)}/`
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return { families };
}
