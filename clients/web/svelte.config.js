import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";

const __dirname = dirname(fileURLToPath(import.meta.url));
const postcssConfigPath = join(__dirname, 'postcss.config.cjs')

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: {
        // The config path must be specified here since we are using a monorepo
        // https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/other-css-preprocessors.md#postcss
        configFilePath: postcssConfigPath,
      },
    }),
  ],

  kit: {
    adapter: adapter(),
  },
};

export default config;
