import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import houdini from 'houdini/vite';

export default defineConfig({
	plugins: [houdini(), sveltekit(), purgeCss()],
	server: {
		strictPort: false,
		host: '0.0.0.0',
		hmr: {
			path: "hmr",
		},
		watch: {
			usePolling: true
		}
	}
});
