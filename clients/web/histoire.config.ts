import { defineConfig } from "histoire";
import { HstSvelte } from "@histoire/plugin-svelte";
import path from "path";

import { palette } from "./src/lib/palette";
const { primary, gray } = palette;

export default defineConfig({
    plugins: [HstSvelte()],
    vite: {
        resolve: {
            alias: {
                '$lib': '/src/lib'
            },
        },
    },

    vite: {
        resolve: {
            alias: {
                '$lib': path.resolve(__dirname, "./src/lib")
            }
        }
    },

    // https://histoire.dev/guide/config.html#global-js-and-css
    setupFile: "/src/lib/histoire/setup.ts",

    theme: {
        title: "Histoire | Sprocket",
        logo: {
            // For some reason, these want `/` while favicon wants `./` 🤷🏼‍♂️
            square: "/static/img/logo-square-primary.png",
            dark: "/static/img/logo-full-dark.png",
            light: "/static/img/logo-full-light.png",
        },
        favicon: "./static/favicon-32x32.png",
        colors: {
            primary: primary,
            gray: {
                ...gray,
                750: "#242424",
                850: "#151515",
                950: "#070707",
            },
        },
    },
});
