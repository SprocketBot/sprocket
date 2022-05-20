import { Module } from "@nestjs/common";


import {DatabaseModule} from "../database";
import {ImageGenerationController} from "./image-generation.controller";
import {ImageGenerationService} from "./image-generation.service";


@Module({
    imports: [DatabaseModule],
    providers: [ImageGenerationService],
    exports: [ImageGenerationService],
    controllers: [ImageGenerationController],
})
export class ImageGenerationModule {}
