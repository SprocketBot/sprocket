import {
    Inject, Injectable, Logger,
} from "@nestjs/common";
import { MinioService } from "@sprocketbot/common";
import {config} from "@sprocketbot/common/lib/util/config";
import {
    createReadStream, existsSync, mkdirSync, rmSync, unlinkSync, writeFileSync,
} from "fs";
import {JSDOM} from "jsdom";
import * as sharp from "sharp";
import { Readable } from "stream";

import {SvgTransformationService} from "./svg-transformation/svg-transformation.service";
import {templateStructureSchema} from "./types";

@Injectable()
export class ImageGenerationService {
    private logger = new Logger(ImageGenerationService.name);

    constructor(
        private minioService:MinioService,
        private svgTransformationService: SvgTransformationService) {
        process.env.FONTCONFIG_PATH = "./fonts";
    }

    async generateScrimReportCard(scrimId: string): Promise<string>{

        return "hello"
    }

    async processSvg(inputFileKey: string, outputFileKey: string, rawData: unknown): Promise<void> {
        this.logger.log(`Beginning Generation of ${inputFileKey}`);
        // eslint-disable-next-line
        const data = templateStructureSchema.parse(rawData);;
        this.logger.debug("Input data successfully parsed");

        const file = await this.minioService.get(config.minio.bucketNames.image_generation, inputFileKey);
        // WriteFileSync("./input.svg", file);

        const dom = new JSDOM(await this.readableToString(file));
        const svgRoot = dom.window.document.body.children[0];
        svgRoot.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink"); // When base image has no images but rect->img transformation may be neccessary
        if (svgRoot.nodeName !== "svg") throw new Error(`Expected <svg>, found ${svgRoot.nodeName}`);
        
        const fonts = Array.from(svgRoot.querySelectorAll("#fonts a"));
        this.logger.debug(`Found ${fonts.length} fonts`);
        
        if (!existsSync("./fonts/temp")) {
            mkdirSync("./fonts/temp");
        }
        const createdFiles: string[] = [];
        
        
        if (fonts.length) {
            await Promise.all(fonts.map(async font => {
                const fontname = font.getAttribute("data-font-name");
                const filename = `./fonts/${fontname}`;
                const fontData = font.getAttribute("href");
                const matches = fontData?.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                if (matches?.[2]) {
                    const buffer = Buffer.from(matches[2], "base64");
                    this.logger.log(`Saving font: ${filename}`);
                    writeFileSync(filename, buffer);
                    createdFiles.push(filename);
                }
            }));
            svgRoot.removeChild(svgRoot.querySelector("#fonts")!);
        }

        const dataNodes = Array.from(svgRoot.querySelectorAll("[data-sprocket]"));
        this.logger.debug(`Found ${dataNodes.length} nodes with data`);
        await Promise.all(dataNodes.map(async dn => {
            await this.svgTransformationService.transformElement(dn, data);
            // Ensure any updates to the node are correctly flushed.
            dn.parentElement?.replaceChild(dn, dn);
        }));
        this.logger.debug(`Transformations successfully applied`);
        
        const newSvg = svgRoot.outerHTML;
        const newSvgBuffer = Buffer.from(newSvg);
        this.logger.debug(`Buffer Created, exporting to image`);
        writeFileSync("./output.svg", newSvg); // TODO: purge [data-sprocket] items from output.svg
        await sharp(newSvgBuffer).png()
            .toFile("./output.png");
        this.logger.debug(`Image rendered!`);

        // Save output to minio
        await this.minioService.put(
            config.minio.bucketNames.image_generation,
            `${outputFileKey}.svg`,
            newSvgBuffer);
        await this.minioService.put(
            config.minio.bucketNames.image_generation,
            `${outputFileKey}.svg`,
            newSvgBuffer);

        // Cleanup files
        for (const f of createdFiles) {
            unlinkSync(f);
            this.logger.log(`removing file: ${f}`);
        }
        if (existsSync("./fonts/temp")) {
            this.logger.log("removing cached fonts");
            rmSync("./fonts/temp", {recursive: true});
        }
        this.logger.log("Finished Processing");
    }

    private async readableToString(file: Readable): Promise<string> {
        return new Promise((resolve, reject) => {
            const output: string[] = [];
            file.on("data", (chunk: Buffer) => {
                output.push(chunk.toString());
            });
            file.on("error", reject);
            file.on("end", () => {
                resolve(output.join(""));
            });
        });
    }
}
