const palette = {
    primary: {
        DEFAULT: "#FEBF2B",
        50: "#FFEFCB",
        100: "#FFEAB9",
        200: "#FFDF96",
        300: "#FED472",
        400: "#FECA4F",
        500: "#FEBF2B",
        600: "#FAB001",
        700: "#CC9001",
        800: "#9F6F01",
        900: "#714F01",
    },
    secondary: {
        DEFAULT: "#FF5A1F",
        50: "#FFE1D7",
        100: "#FFD2C2",
        200: "#FFB499",
        300: "#FF9671",
        400: "#FF7848",
        500: "#FF5A1F",
        600: "#E63D00",
        700: "#AE2E00",
        800: "#761F00",
        900: "#3E1000",
    },
    accent: {
        DEFAULT: "#ED3E93",
        50: "#FBD1E5",
        100: "#F9C1DC",
        200: "#F6A0CA",
        300: "#F37FB8",
        400: "#F05FA5",
        500: "#ED3E93",
        600: "#E8167C",
        700: "#BE1265",
        800: "#940E4F",
        900: "#6A0A38",
    },
    gray: {
        DEFAULT: "#4B4A49",
        50: "#F6F6F6",
        100: "#E3E3E3",
        200: "#BDBDBC",
        300: "#979795",
        400: "#71716F",
        500: "#4B4A49",
        600: "#3B3B3A",
        700: "#2C2C2B",
        800: "#1C1C1C",
        900: "#0D0D0D",
    },
    info: {
        DEFAULT: "#3F83F8",
        50: "#F0F5FE",
        100: "#DCE9FE",
        200: "#B5CFFC",
        300: "#8EB6FB",
        400: "#669CF9",
        500: "#3F83F8",
        600: "#1366F6",
        700: "#0853D3",
        800: "#0641A7",
        900: "#04307B",
    },
    success: {
        DEFAULT: "#1BC058",
        50: "#DEFAE8",
        100: "#C5F7D7",
        200: "#94F0B6",
        300: "#63E994",
        400: "#32E272",
        500: "#1BC058",
        600: "#159343",
        700: "#0F672F",
        800: "#083A1B",
        900: "#020D06",
    },
    warning: {
        DEFAULT: "#E5BE34",
        50: "#FCFAF2",
        100: "#FAF4DB",
        200: "#F6E9BB",
        300: "#F0DB8E",
        400: "#EACD61",
        500: "#E5BE34",
        600: "#C29D19",
        700: "#8C7212",
        800: "#56460B",
        900: "#201A04",
    },
    danger: {
        DEFAULT: "#F62C2C",
        50: "#FEF2F2",
        100: "#FEDCDC",
        200: "#FCB0B0",
        300: "#FA8484",
        400: "#F85858",
        500: "#F62C2C",
        600: "#E50A0A",
        700: "#B40808",
        800: "#830606",
        900: "#4E0303",
    },
}


const spacing = {
    "1/10": "10%",
    "2/10": "20%",
    "3/10": "30%",
    "4/10": "40%",
    "5/10": "50%",
    "6/10": "60%",
    "7/10": "70%",
    "8/10": "80%",
    "9/10": "90%",
    "10/10": "100%",
};

const maxWidth = {
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
};

const maxHeight = {
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
};

////

const config = {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    theme: {
        // Colors are defined here and not in `extend` so that we don't have the default Tailwind colors to confuse us (e.g. red vs danger)
        colors: {
            white: "#FFFFFF",
            black: "#000000",
            transparent: "transparent",
            ...palette,
        },
        extend: {
            animation: {
                "spin-slow": "spin 3s linear infinite",
            },
            spacing,
            maxWidth,
            maxHeight,
            transitionProperty: {
                size: 'height, width',
                height: 'height',
                width: 'width'
            }
        },
    },

    plugins: [
        // Expose colors as css variables
        function ({ addBase, theme }) {
            function extractColorVars(colorObj, colorGroup = '') {
                return Object.keys(colorObj).reduce((vars, colorKey) => {
                    const value = colorObj[colorKey];

                    const newVars =
                        typeof value === 'string'
                            ? { [`--color${colorGroup}-${colorKey}`]: value }
                            : extractColorVars(value, `-${colorKey}`);

                    return { ...vars, ...newVars };
                }, {});
            }

            addBase({
                ':root': extractColorVars(theme('colors')),
            });
        },
    ],
};

module.exports = config;
