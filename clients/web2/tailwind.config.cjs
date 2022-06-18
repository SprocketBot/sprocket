const defaults = require("tailwindcss/defaultTheme")

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			minWidth: defaults.width,
			maxWidth: defaults.width
		}
	},

	plugins: []
};

module.exports = config;
