import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    if (event.url.pathname.endsWith('/index.html')) {
        const target = new URL(event.url);
        target.pathname = target.pathname.replace(/index\.html$/, '');

        // Keep old deep links working after moving from Vite index.html to SvelteKit routes.
        throw redirect(308, target.pathname + target.search + target.hash);
    }

    return resolve(event);
}
