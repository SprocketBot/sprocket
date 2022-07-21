import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ["src/lib/config.json"],
		allowNodeBuiltins: ['fs']
	},
	server: {
		port: 3000
	}

};

export default config;
