import {Injectable, Logger} from "@nestjs/common";
import axios from "axios";
import * as sharp from "sharp";

import {
    dataForLinkType,
    Dimension, ImageTransformationsOptions,
    SprocketData, TextTransformationOptions,
} from "../types";
import {sprocketDataSchema} from "../types";
import { DataLeaf, TemplateStructure } from "@sprocketbot/common";

@Injectable()
export class SvgTransformationService {
    private logger = new Logger(SvgTransformationService.name);

    private imageLookup = new Map<string, string>();

    async getElDimension(el: Element): Promise<Dimension> {
        const styles = Array.from(el.ownerDocument.querySelectorAll("style"))
            .map(s => s.outerHTML)
            .join("\n");
        
        const str = `<svg>
                ${styles}
                ${el.outerHTML}
            </svg>`;
        
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

    async resolveTargetImage(el: Element): Promise<Element | false> {
        if (el.hasAttribute("fill")) {
            const fill = el.getAttribute("fill")!;
            const match = fill.match(/url\((#[\w]+)\)/);
            if (match) {
                const newTarget = el.ownerDocument.querySelector(match[1]);
                if (newTarget) {
                    return this.resolveTargetImage(newTarget);
                }
            } else if (el.nodeName === "rect") {
                return el;
            }
        }
        if (el.nodeName === "pattern") {
            const children = Array.from(el.children);
            const use = children.find(child => child.nodeName === "use");
            if (use) {
                if (use.hasAttribute("xlink:href")) {
                    const newTarget = el.ownerDocument.querySelector(use.getAttribute("xlink:href")!);
                    if (newTarget) {
                        return await this.resolveTargetImage(newTarget);
                    }
                }
            }
        }
        if (el.nodeName === "image") {
            return el;
        }
    
        
        return false;
    }
    

    async applyImageTransformation(el: Element, value: string, options: ImageTransformationsOptions): Promise<void> {
        let target = el;
        if (target.nodeName !== "image") {
            // Attempt to resolve the actual image
            const attempt = await this.resolveTargetImage(el);
            if (attempt) {
                target = attempt;
            } else {
                // Fail
                this.logger.warn(`Invalid element type ${el.nodeName} found for image transformation! Skipping...`);
                return;
            }
        }
        
        /*
         * TODO: Ensure that string generic typing is correct here
         */
        let image = this.imageLookup.get(value);
        if (!image) {
            const response = await axios.get<string>(value, {
                responseType: "arraybuffer",
            });
        
            if (response.headers?.["content-type"] !== "image/png") {
                this.logger.warn("Found invalid image format for image transformation! Skipping...");
                return;
            }
            /*
             * TODO: Transform image to retain centering and height
             * TODO: Maintain Height or Maintain Width as an option
             */
            image = `data:image/png;base64,${Buffer.from(response.data, "binary").toString("base64")}`;
            this.imageLookup.set(value, image);
        }
        if (target.nodeName === "image") {
            target.setAttribute("xlink:href", image);
        } else if (target.nodeName === "rect") {
            // Create new image element
            const newImage = target.ownerDocument.createElement("image");
            for (const attr of target.attributes) {
                newImage.setAttribute(attr.name, attr.value);
            }
            newImage.setAttribute("xlink:href", image);
            target.parentNode?.replaceChild(newImage, target);
        }
        /*
         * TODO: Deal with figma output ( fill=url(#pattern) )
         * TODO: Image rescaling options
         */
        if (options.rescaleOn === "height") return;
        
    }

    async applyTextTransformation(el: Element, value: string, options: TextTransformationOptions): Promise<void> {
        const children = Array.from(el.children);
        // Some editors output text in a tspan (i.e. Figma), we need to account for that
        let target: Element = el;
        if (children.length && children[0].tagName === "tspan") {
            target = children[0];
        }
        // TODO: Account for editors that use transformations (i.e. Illustrator)
        const originalLeft = Number(target.getAttribute("x") ?? 0);
        const originalBottom = Number(target.getAttribute("y") ?? 0);
        const {height: originalHeight, width: originalWidth} = await this.getElDimension(el);
        
        let newtext = value;
        const truncate = options["truncate-to"]
        console.log(truncate)
        if (truncate && truncate !== 'as-is') {
            newtext = newtext.slice(0,truncate)
        }
        switch (options.case) {
            case "upper":
                newtext = newtext.toUpperCase()
                break;
            case "lower":
                newtext = newtext.toLowerCase()
                break;
            default: break;
        }


        target.textContent = newtext;

        const {height: newHeight, width: newWidth} = await this.getElDimension(el);

        switch (options["h-align"]) {
            case "right": {
                const widthOffset = newWidth - originalWidth;
                const newLeft = originalLeft - widthOffset;
                target.setAttribute("x", `${newLeft}`);
                break;
            }
            case "center": { // Move in x based on half difference in width
                const diffWidth = newWidth - originalWidth;
                const widthOffset = diffWidth / 2;
                const newLeft = originalLeft - widthOffset;
                target.setAttribute("x", `${newLeft}`);
                break;
            }
            default: break;
        }
        switch (options["v-align"]) {
            case "top": {
                const heightOffset = newHeight - originalHeight;
                const newBottom = originalBottom + heightOffset; // Positive is down
                target.setAttribute("y", `${newBottom}`);
                break;
            }
            case "center": { // Move in x based on half difference in width
                const diffHeight = newHeight - originalHeight;
                const heightOffset = diffHeight / 2;
                const newBottom = originalBottom + heightOffset;
                target.setAttribute("y", `${newBottom}`);
                break;
            }
            default: break;
        }
    }

    async applyFillTransformation(el: Element, value: string): Promise<void> {
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

    async applyStrokeTransformation(el: Element, value: string): Promise<void> {
        function swapStroke(target: SVGElement): void {
            if (target.hasAttribute("stroke")) {
                target.style.stroke = value;
            }
            if (target.hasAttribute("stroke")) {
                target.setAttribute("stroke", value);
            }
        }
        if (el.nodeName === "g") {
            const children = Array.from(el.children);
            for (const child of children) {
                swapStroke(child as SVGElement);
            }
        } else {
            swapStroke(el as SVGElement);
        }
    }

    extractDataFromStructure(key: string, data: TemplateStructure): DataLeaf | false {
        // eslint-disable-next-line
        let val: TemplateStructure | DataLeaf = data;
        const segments = key.split(".");
        for (const segment of segments) {
            // eslint-disable-next-line
            if (Object.keys(val).includes(segment)) {
                val = val[segment];
            } else {
                this.logger.warn(`Unknown value ${key} found! Skipping...`);
                return false;
            }
        }
        val = val as DataLeaf;
        return val;
    }
    
    async transformElement(el: Element, data: TemplateStructure): Promise<void> {
        const rawTransformations = JSON.parse((el as SVGElement).dataset.sprocket ?? "") as SprocketData[];
        const transformations = sprocketDataSchema.parse(rawTransformations);
        
        try {
            await Promise.all(transformations.map(async t => {
                const datum = this.extractDataFromStructure(t.varPath, data);
                if (!datum) return Promise.resolve();
                if (!dataForLinkType[t.type].includes(datum.type)) {
                    this.logger.warn(`Problem parsing operation for ${t.varPath}. ${datum.type} cannot be applied to ${t.type}! Skipping ...`);
                    return Promise.resolve();
                }
                switch (t.type) {
                    case "number":
                    case "text":
                        await this.applyTextTransformation(el, datum.value.toString(), t.options);
                        break;
                    case "fill":
                        await this.applyFillTransformation(el, datum.value.toString());
                        break;
                    case "stroke":
                        await this.applyStrokeTransformation(el, datum.value.toString());
                        break;
                    case "image":
                        await this.applyImageTransformation(el, datum.value.toString(), t.options);
                        break;
                    default:
                        // Leaving this here for when we create future transformation types
                        this.logger.warn(`Unknown operation ${t} found! Skipping...`);
                }
                return Promise.resolve();
            }));
        } catch (e) {
            this.logger.warn(`failed to apply transformation to ${el.id}`)
            throw e
        }
        el.removeAttribute("data-sprocket");
        this.logger.log(`successfully applied transformation to ${el.id}`);

    }
}
