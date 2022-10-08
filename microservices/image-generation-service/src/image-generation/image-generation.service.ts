import {Injectable, Logger} from "@nestjs/common";
import type {Template} from "@sprocketbot/common";
import {config, MinioService, readToString} from "@sprocketbot/common";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import {JSDOM} from "jsdom";
import * as sharp from "sharp";

import {SvgTransformationService} from "./svg-transformation/svg-transformation.service";

@Injectable()
export class ImageGenerationService {
    private logger = new Logger(ImageGenerationService.name);

    constructor(
        private minioService: MinioService,
        private svgTransformationService: SvgTransformationService,
    ) {
        process.env.FONTCONFIG_PATH = "./fonts";
    }

    async processSvg(
        inputFileKey: string,
        outputFileKey: string,
        data: Template,
    ): Promise<string> {
        this.logger.log(`Beginning Generation of ${inputFileKey}`);
        // eslint-disable-next-line
        //const data = templateStructureSchema.parse(rawData); //moved to controller

        const file = await this.minioService.get(
            config.minio.bucketNames.image_generation,
            inputFileKey,
        );
        // WriteFileSync("./input.svg", file);

        const dom = new JSDOM(await readToString(file));
        const svgRoot = dom.window.document.body.children[0];
        svgRoot.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"); // When base image has no images but rect->img transformation may be neccessary
        if (svgRoot.nodeName !== "svg")
            throw new Error(`Expected <svg>, found ${svgRoot.nodeName}`);

        const fonts = Array.from(svgRoot.querySelectorAll("#fonts a"));
        this.logger.debug(`Found ${fonts.length} fonts`);

        if (!existsSync("./fonts/temp")) {
            mkdirSync("./fonts/temp", {recursive: true});
        }
        // Const createdFiles: string[] = [];

        if (fonts.length) {
            await Promise.all(
                fonts.map(async font => {
                    const fontname = font.getAttribute("data-font-name");
                    const filename = `./fonts/${fontname}`;
                    const fontData = font.getAttribute("href");
                    const matches = fontData?.match(
                        /^data:([A-Za-z-+/]+);base64,(.+)$/,
                    );
                    if (matches?.[2]) {
                        const buffer = Buffer.from(matches[2], "base64");
                        this.logger.log(`Saving font: ${filename}`);
                        writeFileSync(filename, buffer);
                        // CreatedFiles.push(filename);
                    }
                }),
            );
            svgRoot.removeChild(svgRoot.querySelector("#fonts")!);
        }

        const dataNodes = Array.from(
            svgRoot.querySelectorAll("[data-sprocket]"),
        );
        this.logger.debug(`Found ${dataNodes.length} nodes with data`);
        await Promise.all(
            dataNodes.map(async dn => {
                await this.svgTransformationService.transformElement(dn, data);
                // Ensure any updates to the node are correctly flushed.
                dn.parentElement?.replaceChild(dn, dn);
            }),
        );
        this.logger.debug(`Transformations successfully applied`);

        const newSvg = svgRoot.outerHTML;
        const newSvgBuffer = Buffer.from(newSvg);

        /*
         * WriteFileSync("./output.svg", newSvg);
         *  await sharp(newSvgBuffer).png()
         *      .toFile("./output.png");
         *  this.logger.debug(`Image rendered!`);
         */

        this.logger.debug(`Buffer Created, uploading to Minio`);
        // Save output to minio
        await this.minioService.put(
            config.minio.bucketNames.image_generation,
            `${outputFileKey}.svg`,
            newSvgBuffer,
        );
        await this.minioService.put(
            config.minio.bucketNames.image_generation,
            `${outputFileKey}.png`,
            await sharp(newSvgBuffer).png().toBuffer(),
        );

        /*
         * This causes issues with multiple files running simultaneously - need solution when we start running with a lot of different templates
         * Cleanup files
         * for (const f of createdFiles) {
         *     unlinkSync(f);
         *     this.logger.log(`removing file: ${f}`);
         * }
         */

        /*
         * if (existsSync("./fonts/temp")) {
         *     this.logger.log("removing cached fonts");
         *     rmSync("./fonts/temp", {recursive: true});
         * }
         */
        this.logger.log("Finished Processing");
        return outputFileKey;
    }
}
