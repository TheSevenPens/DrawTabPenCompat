import { base } from '$app/paths';
import { getCompatibilityData } from '../../lib/compatibility-data-store.js';

export async function load({ fetch }) {
  const data = await getCompatibilityData(base, fetch);

  return {
    diagnostics: data.diagnostics || {
      pensWithoutTablets: [],
      tabletsWithoutPens: [],
      duplicatePairs: []
    },
    loadedAtIso: data.loadedAtIso || '',
    penDefs: data.penDefs,
    tabletDefs: data.tabletDefs
  };
}
