import { base } from '$app/paths';
import { getCompatibilityData } from '../../lib/compatibility-data-store.js';

export async function load({ fetch }) {
  const data = await getCompatibilityData(base, fetch);
  const brandSet = new Set();
  for (const [, def] of data.tabletDefs) if (def.brand) brandSet.add(def.brand);
  for (const [, def] of data.penDefs) if (def.brand) brandSet.add(def.brand);
  const brands = [...brandSet].sort();

  return {
    compatibilityPairs: data.pairs,
    tabletDefs: data.tabletDefs,
    penDefs: data.penDefs,
    brands
  };
}
