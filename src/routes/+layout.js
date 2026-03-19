import { browser } from '$app/environment';
import { base } from '$app/paths';
import { getCompatibilityData } from '../lib/compatibility-data-store.js';

export const prerender = true;
export const trailingSlash = 'always';

export async function load() {
	if (!browser) {
		return {};
	}

	try {
		await getCompatibilityData(base);
	} catch (err) {
		// Page-level loaders/components still handle their own error states.
		console.warn('Background compatibility prefetch failed', err);
	}

	return {};
}
