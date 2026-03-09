import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    server: {
        port: 8080,
    },
    plugins: [sveltekit()],
    build: {
        sourcemap: true, // Enable sourcemaps for debugging
    }
});
