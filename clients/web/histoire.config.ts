import {defineConfig} from "histoire";
import {HstSvelte} from "@histoire/plugin-svelte";

import tailwind from "./tailwind.config.cjs";
const {primary, gray} = tailwind.theme.colors;

export default defineConfig({
    plugins: [HstSvelte()],

    // https://histoire.dev/guide/config.html#global-js-and-css
    setupFile: "./src/histoire.setup.ts",

    theme: {
        title: "Histoire | Sprocket",
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
