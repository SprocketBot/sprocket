import preprocess from 'svelte-preprocess';
import nodeAdapter from '@sveltejs/adapter-node';
import { resolve } from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({ postcss: true }),

  kit: {
    adapter: nodeAdapter(),
  },
};

export default config;
