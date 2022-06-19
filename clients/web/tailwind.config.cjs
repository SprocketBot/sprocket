const daisy = require("daisyui")
const c = require("color")

const sprocketPalette = {
  primary: "#FEBF2B",
  secondary: "#F15A24",
  accent: "#0097D7",
  success: "#189666",
  info: "#635DB2",
  error: "#D81C0E",
  gray: {
    "100": "#CFD2D3",
    "200": "#AFB1B2",
    "300": "#8F9091",
    "400": "#6F6F70",
    "500": "#4e4d4e",
    "600": "#3E3E3E",
    "700": "#2E2E2E",
    "800": "#1E1E1E",
    "900": "#0d0e0e"
  }
}


const config = {
  mode: 'jit',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite"
      },
      colors: {
        "sprocket": sprocketPalette.primary,

        "sprocket-light-gray": sprocketPalette.gray["100"],
        "sprocket-gray": sprocketPalette.gray["500"],
        "sprocket-dark-gray": sprocketPalette.gray["900"],
        "sprocket-pink": sprocketPalette.accent,
        "sprocket-purple": sprocketPalette.purple,
        "sprocket-blue": sprocketPalette.secondary,
        gray: sprocketPalette.gray
      },
      spacing: {
        '1/10': '10%',
        '2/10': '20%',
        '3/10': '30%',
        '4/10': '40%',
        '5/10': '50%',
        '6/10': '60%',
        '7/10': '70%',
        '8/10': '80%',
        '9/10': '90%',
        '10/10': '100%'
      },
      maxWidth: {
        "1/2": "50%",
        "1/3": "33.333333%",
        "2/3": "66.666667%",
        "1/4": "25%",
        "2/4": "50%",
        "3/4": "75%",
        "1/5": "20%",
        "2/5": "40%",
        "3/5": "60%",
        "4/5": "80%",
        "1/6": "16.666667%",
        "2/6": "33.333333%",
        "3/6": "50%",
        "4/6": "66.666667%",
        "5/6": "83.333333%",
        "1/12": "8.333333%",
        "2/12": "16.666667%",
        "3/12": "25%",
        "4/12": "33.333333%",
        "5/12": "41.666667%",
        "6/12": "50%",
        "7/12": "58.333333%",
        "8/12": "66.666667%",
        "9/12": "75%",
        "10/12": "83.333333%",
        "11/12": "91.666667%",
      },
      maxHeight: {
        "1/2": "50%",
        "1/3": "33.333333%",
        "2/3": "66.666667%",
        "1/4": "25%",
        "2/4": "50%",
        "3/4": "75%",
        "1/5": "20%",
        "2/5": "40%",
        "3/5": "60%",
        "4/5": "80%",
        "1/6": "16.666667%",
        "2/6": "33.333333%",
        "3/6": "50%",
        "4/6": "66.666667%",
        "5/6": "83.333333%",
        "1/12": "8.333333%",
        "2/12": "16.666667%",
        "3/12": "25%",
        "4/12": "33.333333%",
        "5/12": "41.666667%",
        "6/12": "50%",
        "7/12": "58.333333%",
        "8/12": "66.666667%",
        "9/12": "75%",
        "10/12": "83.333333%",
        "11/12": "91.666667%",
      },
    },
  },

  plugins: [daisy],
  daisyui: {
    styled: true,
    themes: [{
      sprocket: {
        "primary": sprocketPalette.primary,
        "primary-focus": c(sprocketPalette.primary).darken(0.1),
        "primary-content": "#FFFFFF",

        "secondary": sprocketPalette.secondary,
        "secondary-focus": c(sprocketPalette.secondary).darken(0.1),
        "secondary-content": "#FFFFFF",

        "accent": sprocketPalette.accent,
        "accent-focus": c(sprocketPalette.accent).darken(0.1),
        "accent-content": "#edc5d4",

        "neutral": "#3d4451",
        "neutral-focus": "#2a2e37",
        "neutral-content": "#CFD2D3",

        "base-100": sprocketPalette.gray["500"],
        "base-200": sprocketPalette.gray["700"],
        "base-300": sprocketPalette.gray["900"],
        "base-content": "#ebecf0",

        // TODO: This:
        "info": sprocketPalette.info,
        "success": sprocketPalette.success,
        "warning": "#e1d460",
        "error": sprocketPalette.error,
      },
    },],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    darkTheme: "dark",
  },
};

module.exports = config;
