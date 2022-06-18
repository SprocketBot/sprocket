const preprocess = require("svelte-preprocess")
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.svelte"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
    ],
  "framework": "@storybook/svelte",
  "svelteOptions": {
    "preprocess": preprocess({ postcss: true, typescript: true })
  },
  core: { builder: "@storybook/builder-vite" },
  async viteFinal(config) {
    return {
      ...config,
      define: {
        ...config.define,
        global: "window",
      },
    };
  }
}
