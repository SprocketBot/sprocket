import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
   // ... configs
  },
  // add the line below
  plugins: [swc.vite()],
});
