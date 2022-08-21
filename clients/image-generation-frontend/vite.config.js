import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	optimizeDeps: {
		allowNodeBuiltins: ['fs']
	},
	server: {
		port: 3000
	},
	noExternal: false,
	resolve: {
		alias: {
			$src: resolve('src/'),
			$api: resolve('src/api/'),
			$components: resolve('src/components/'),
			$routes: resolve('src/routes/'),
			$utils: resolve('src/utils/')
		}
	}
};

export default config;
