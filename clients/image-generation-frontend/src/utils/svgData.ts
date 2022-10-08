import {tick} from "svelte";

export async function getSVGData(
    file: File,
): Promise<{previewEl: SVGElement; filename: string}> {
    let previewEl: SVGElement;
    let filename: string;
    if (file) {
        const svgData: string = await new Promise((res, rej) => {
            const reader = new FileReader();

            reader.onloadend = e => {
                res(e.target.result.toString());
            };
            reader.onerror = () => {
                rej("Error reading");
            };

            reader.readAsText(file);
        });
        await tick();
        const parser = new DOMParser();
        const newEl = parser.parseFromString(svgData, "image/svg+xml")
            .children[0];
        if (newEl.nodeName === "svg" && newEl instanceof SVGElement) {
            previewEl = newEl;
            filename = file.name;
        } else {
            filename = "Please select an SVG";
        }
    }
    return {
        previewEl,
        filename,
    };
}
