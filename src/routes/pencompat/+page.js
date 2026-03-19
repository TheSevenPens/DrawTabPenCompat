import { base } from '$app/paths';
import { getCompatibilityData } from '../../lib/compatibility-data-store.js';

export async function load({ fetch }) {
  const data = await getCompatibilityData(base, fetch);
  return {
    compatibilityPairs: data.pairs,
    tabletDefs: data.tabletDefs,
    penDefs: data.penDefs
  };
}
