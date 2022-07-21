import preprocess from 'svelte-preprocess';
import nodeAdapter from "@sveltejs/adapter-node";
import { resolve } from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({postcss: true}),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		vite: {
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
		},
		adapter: nodeAdapter()
	},
};

export default config;
