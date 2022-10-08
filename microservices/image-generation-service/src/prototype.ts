/* eslint-env node */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import axios from "axios";
import {readFile} from "fs/promises";
import {JSDOM} from "jsdom";
import sharp from "sharp";

import type {
    Dimension, InputDatum, Operation,
} from "./prototype.types";
import {operationSchema} from "./prototype.types";

const logger = console;

interface TextTransformationOptions {
    center: boolean;
}
const defaultTextTransformationOptions = {
    center: true,
};

async function getElDimension(el: Element): Promise<Dimension> {
    const str = `<svg>${el.outerHTML}</svg>`;
    const buf = Buffer.from(str);
    const sharpBuffer = sharp(buf).png();
    const metadata = await sharpBuffer.metadata();
    if (!metadata.height || !metadata.width) {
        throw new Error("Missing height or width metadata!");
    }
    return {
        height: metadata.height,
        width: metadata.width,
    };
}

// TODO: Figure out a way to embed the options into the svg document (or id, I guess)
async function applyTextTransformation(el: Element, value: string, options: TextTransformationOptions = defaultTextTransformationOptions): Promise<void> {
    const children = Array.from(el.children);
    // Some editors output text in a tspan (i.e. Figma), we need to account for that
    let target: Element = el;
    if (children.length && children[0].tagName === "tspan") {
        target = children[0];
    }
    if (options.center) {
        // TODO: Account for editors that use transformations (i.e. Illustrator)
        const originalLeft = Number(target.getAttribute("x") ?? 0);
        const originalBottom = Number(target.getAttribute("y") ?? 0);
        const {height: originalHeight, width: originalWidth} = await getElDimension(el);
        let halfWidth = originalWidth / 2;
        const originalCenterX = halfWidth + originalLeft;
        let halfHeight = originalHeight / 2;
        const originalCenterY = originalBottom - halfHeight;
        target.textContent = value;
   
        const {height: newHeight, width: newWidth} = await getElDimension(el);
        halfHeight = newHeight / 2;
        const newBottom = originalCenterY + halfHeight;
        halfWidth = newWidth / 2;
        const newLeft = originalCenterX - halfWidth;
        target.setAttribute("x", newLeft.toString());
        target.setAttribute("y", newBottom.toString());

    } else {
        target.textContent = value;
    }
}

async function applyFillTransformation(el: Element, value: string): Promise<void> {
    function swapFill(target: SVGElement): void {
        if (target.hasAttribute("style")) {
            target.style.fill = value;
        }
        if (target.hasAttribute("fill")) {
            target.setAttribute("fill", value);
        }
    }
    if (el.nodeName === "g") {
        const children = Array.from(el.children);
        for (const child of children) {
            swapFill(child as SVGElement);
        }
    } else {
        swapFill(el as SVGElement);
    }
}

async function resolveTargetImage(el: Element): Promise<Element | false> {
    if (el.hasAttribute("fill")) {
        const fill = el.getAttribute("fill")!;
        const match = fill.match(/url\((#[\w]+)\)/);
        if (match) {
            const newTarget = el.ownerDocument.querySelector(match[1]);
            if (newTarget) {
                return resolveTargetImage(newTarget);
            }
        }
    }
    if (el.nodeName === "pattern") {
        const children = Array.from(el.children);
        const use = children.find(child => child.nodeName === "use");
        if (use) {
            if (use.hasAttribute("xlink:href")) {
                const newTarget = el.ownerDocument.querySelector(use.getAttribute("xlink:href")!);
                if (newTarget) {
                    return resolveTargetImage(newTarget);
                }
            }
        }
    }
    if (el.nodeName === "image") {
        return el;
    }
    
    return false;
}

async function applyImageTransformation(el: Element, value: string): Promise<void> {
    let target = el;
    // If(el.nodeName !== "image" && !el.hasAttribute("fill") && !el.getAttribute("fill").startsWith("url(#")) {
    if (target.nodeName !== "image") {
        // Attempt to resolve the actual image
        const attempt = await resolveTargetImage(el);
        if (attempt) {
            target = attempt;
        } else {
            // Fail
            logger.warn(`Invalid element type ${el.nodeName} found for image transformation! Skipping...`);
            return;
        }
    }
    
    /*
     * TODO: Memoize
     * TODO: Ensure that string generic typing is correct here
     */
    const response = await axios.get<string>(value, {
        responseType: "arraybuffer",
    });

    if (response.headers?.["content-type"] !== "image/png") {
        logger.warn("Found invalid image format for image transformation! Skipping...");
    }
    /*
     * TODO: Transform image to retain centering and height
     * TODO: Maintain Height or Maintain Width as an option
     */
    const image = `data:image/png;base64,${Buffer.from(response.data, "binary").toString("base64")}`;
    if (target.nodeName === "image") {
        target.setAttribute("xlink:href", image);
    }
    // TODO: Deal with figma output ( fill=url(#pattern) )
    
}

function extractOperation(key: string, data: InputDatum): Operation | false {
    let val: InputDatum | Operation | object = data;

    for (const segment of key.split(".")) {
        if (Object.keys(val).includes(segment)) {
            val = val[segment] as object;
        } else {
            logger.warn(`Unknown value ${key} found! Skipping...`);
            return false;
        }
    }
    const checked = operationSchema.safeParse(val);
    if (!checked.success) {
        logger.warn(`Malformed object at ${key} found! Skipping... (${checked.error})`);
        return false;
    }
    return checked.data;
}

async function transformElement(el: Element, data: InputDatum): Promise<void> {
    let fullValue = el.id;
    if (el.hasAttribute("data-name")) {
        fullValue = el.getAttribute("data-name")!;
    }
    fullValue = fullValue.toLowerCase()
    // Escapes for illustrator
        .replace(/_x7b_/g, "{")
        .replace(/_x7d_/, "}");
    
    while (fullValue.match(/_[\d]_$/)) fullValue = fullValue.replace(/_[\d]_$/, "");
        
    const match  = fullValue.match(/^[{]((?:(?:[\w]+)\.)*(?:[\w]+))[}]$/);
    if (match) {
        const operation = extractOperation(match[1], data);
        if (!operation) return;
        switch (operation.type) {
            case "text":
                await applyTextTransformation(el, operation.value.toString());
                break;
            case "fill":
                await applyFillTransformation(el, operation.value.toString());
                break;
            case "image":
                await applyImageTransformation(el, operation.value.toString());
                break;
            default:
                logger.warn(`Unknown operation ${operation.type} found! Skipping...`);
        }
    }
}

async function recursiveTransform(el: Element, data: InputDatum, debug = true, depth = 0): Promise<void> {
    await transformElement(el, data);

    if (debug) {
        // Print a depth-indented summary of the element we are inspecting
        const attrString = Array.from(el.attributes)
            .filter(attr => !attr.value.startsWith("data:image"))
            .map(attr => `${attr.name}=${attr.value}`)
            .join(" ");
        const indent = new Array(depth).fill("  ")
            .join("");
        logger.debug(`${indent}${el.tagName} | ${attrString} ${el.textContent?.startsWith("\n") ? "" : ` -> ${el.textContent}`}`);
    }
    // Transform children to an array
    const children = Array.from(el.children);

    // Recursve over all children
    for (const child of children) {
        await recursiveTransform(child, data, debug, depth + 1);
    }
}

async function processSvg(inputFilePath: string, outputFilePath: string, data: InputDatum): Promise<void> {
    logger.debug(`============================= ${inputFilePath} =============================`);
    const svg = await readFile(inputFilePath);
    const dom = new JSDOM(svg.toString());
    
    const svgRoot = dom.window.document.body.children[0];
    await recursiveTransform(svgRoot, data);
    
    const newSvg = svgRoot.outerHTML;
    const newSvgBuffer = Buffer.from(newSvg);
    
    await sharp(newSvgBuffer).png()
        .toFile(outputFilePath);
}

async function techDemo(): Promise<void> {
    const data: InputDatum = {
        player: [
            {
                team: {
                    name: {value: "Knights", type: "text"},
                    branding: {
                        primary: {value: "#b20000", type: "fill"},
                        secondary: {value: "#8e8e8e", type: "fill"},
                        logo: {value: "https://cdn.mlesports.dev/public/img/teams/Knights.png", type: "image"},
                    },
                },
                name: {value: "...", type: "text"},
                stats: {
                    goals: {value: Math.floor(Math.random() * 5).toString(), type: "text"},
                    shots: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    saves: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    assists: {value: Math.floor(Math.random() * 5).toString(), type: "text"},
                },
                league: {
                    name: {value: "Premier", type: "text"},
                    branding: {
                        primary: {value: "#E2B22D", type: "fill"},
                    },
                },
            },
            {
                team: {
                    name: {value: "Aviators", type: "text"},
                    branding: {
                        primary: {value: "#006847", type: "fill"},
                        secondary: {value: "#b7b7b7", type: "fill"},
                        logo: {value: "https://cdn.mlesports.dev/public/img/teams/Aviators.png", type: "image"},
                    },
                },
                name: {value: "BroskiJAZZ", type: "text"},
                stats: {
                    goals: {value: ".", type: "text"},
                    shots: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    saves: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    assists: {value: Math.floor(Math.random() * 5).toString(), type: "text"},
                },
                league: {
                    name: {value: "Master", type: "text"},
                    branding: {
                        primary: {value: "#d10056", type: "fill"},
                    },
                },
            },
            {
                team: {
                    name: {value: "Express", type: "text"},
                    branding: {
                        primary: {value: "#00254c", type: "fill"},
                        secondary: {value: "#eeb311", type: "fill"},
                        logo: {value: "https://cdn.mlesports.dev/public/img/teams/Express.png", type: "image"},
                    },
                },
                name: {value: "C0P3x", type: "text"},
                stats: {
                    goals: {value: Math.floor(Math.random() * 5).toString(), type: "text"},
                    shots: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    saves: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    assists: {value: Math.floor(Math.random() * 5).toString(), type: "text"},
                },
                league: {
                    name: {value: "Champion", type: "text"},
                    branding: {
                        primary: {value: "#7E55CE", type: "fill"},
                    },
                },
            },
            {
                team: {
                    name: {value: "Flames", type: "text"},
                    branding: {
                        primary: {value: "#c92a06", type: "fill"},
                        secondary: {value: "#f6c432", type: "fill"},
                        logo: {value: "https://cdn.mlesports.dev/public/img/teams/Flames.png", type: "image"},
                    },
                },
                name: {value: "FLaMEz", type: "text"},
                stats: {
                    goals: {value: Math.floor(Math.random() * 5).toString(), type: "text"},
                    shots: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    saves: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    assists: {value: Math.floor(Math.random() * 5).toString(), type: "text"},
                },
                league: {
                    name: {value: "Academy", type: "text"},
                    branding: {
                        primary: {value: "#0085fa", type: "fill"},
                    },
                },
            },
            {
                team: {
                    name: {value: "Hive", type: "text"},
                    branding: {
                        primary: {value: "#ffa000", type: "fill"},
                        secondary: {value: "#111111", type: "fill"},
                        logo: {value: "https://cdn.mlesports.dev/public/img/teams/Hive.png", type: "image"},
                    },
                },
                name: {value: "Novanta", type: "text"},
                stats: {
                    goals: {value: Math.floor(Math.random() * 5).toString(), type: "text"},
                    shots: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    saves: {value: Math.floor(Math.random() * 10).toString(), type: "text"},
                    assists: {value: Math.floor(Math.random() * 5).toString(), type: "text"},
                },
                league: {
                    name: {value: "Foundation", type: "text"},
                    branding: {
                        primary: {value: "#4EBEEC", type: "fill"},
                    },
                },
            },
        ],
        
    };
    await processSvg("./tmp/sources/techdemo_figma.svg",       "./tmp/output/techdemo_figma_after.png", data);
    await processSvg("./tmp/sources/techdemo_figma.svg",       "./tmp/output/techdemo_figma_before.png", {});
    await processSvg("./tmp/sources/techdemo_illustrator.svg", "./tmp/output/techdemo_illustrator_after.png", data);
    await processSvg("./tmp/sources/techdemo_illustrator.svg", "./tmp/output/techdemo_illustrator_before.png", {});
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main(): Promise<void> {
    const data: InputDatum = {
        player: {
            name: {value: "Zach", type: "text"},
            stats: {
                mvpr: {value: "6.9", type: "text"},
                goals: {value: "6.9", type: "text"},
                shots: {value: "6.9", type: "text"},
                saves: {value: "6.9", type: "text"},
                assists: {value: "6.9", type: "text"},
            },
        },
        branding: {
            team: {
                primary: {value: "#006100", type: "fill"},
                logo: {value: "https://cdn.mlesports.dev/public/img/teams/Knights.png", type: "image"},
            },
        },
    };
    await processSvg("./thing2.svg", "./thing2.png", data);
    await processSvg("./Frame_1_3.svg", "./Frame_1_3.png", data);
    await processSvg("./Frame_1_6.svg", "./Frame_1_6.png", data);
}

// Main();
techDemo().catch(logger.error.bind(logger));
