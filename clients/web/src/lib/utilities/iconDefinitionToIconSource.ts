import type { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import type { IconSource } from "@steeze-ui/svelte-icon/types";

export const IconDefinitionToIconSource = (input: IconDefinition): IconSource => {
    return {
        default: {
            a: {
                viewBox: `0 0 ${input.icon[0]} ${input.icon[1]}`,
                stroke: "currentColor",
                fill: "currentColor",
            },
            path: [{
                d: input.icon[4].toString()
            }]
        }
    }
}