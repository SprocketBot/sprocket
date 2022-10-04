import { defineConfig } from 'histoire'
import { HstSvelte } from '@histoire/plugin-svelte'

export default defineConfig({
  plugins: [
    HstSvelte(),
  ],
  // https://histoire.dev/guide/config.html#global-js-and-css
  setupFile: './src/histoire.setup.ts',
})
