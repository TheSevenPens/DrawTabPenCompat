import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    base: '', // Use relative paths for assets inside Github Pages
    server: {
        port: 8080,
    },
    plugins: [
        svelte({
            compilerOptions: {
                dev: true
            },
            inspector: {
                toggleKeyCombo: 'meta-shift',
                showToggleButton: 'always',
                toggleButtonPos: 'bottom-right'
            }
        })
    ],
    build: {
        sourcemap: true, // Enable sourcemaps for debugging
    }
});
