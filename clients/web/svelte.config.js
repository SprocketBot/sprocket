import adapter from '@sveltejs/adapter-node';

import preprocess from 'svelte-preprocess';

const onwarn = (warning, handler) => {
  if (warning.code === 'css-unused-selector') return;
  handler(warning);
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
  onwarn,

  kit: {
    adapter: adapter(),
  },
};

export default config;
