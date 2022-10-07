const path = require('node:path');

const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const nesting = require('tailwindcss/nesting');

const tailwindConfigPath = path.resolve(__dirname, './tailwind.config.cjs')

const config = {
  /**
   * Plugin order matters!
   * Some plugins, like tailwindcss/nesting, need to run before Tailwind,
   * But others, like autoprefixer, need to run after,
   */
  plugins: [
    nesting,
    // The config path must be specified here since we are using a monorepo
    // https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/other-css-preprocessors.md#tailwindcss
    tailwindcss(tailwindConfigPath),
    autoprefixer,
  ],
};

module.exports = config;
