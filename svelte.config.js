import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const basePath = process.env.BASE_PATH ?? (process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}` : '');

const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({
            pages: 'dist',
            assets: 'dist'
        }),
        paths: {
            base: basePath
        }
    }
};

export default config;
