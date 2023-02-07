import {Module} from "@nestjs/common";
import {S3Module} from "@sprocketbot/common";

import {ImageGenerationController} from "./image-generation.controller";
import {ImageGenerationService} from "./image-generation.service";
import {SvgTransformationService} from "./svg-transformation/svg-transformation.service";

@Module({
    imports: [S3Module],
    providers: [ImageGenerationService, SvgTransformationService],
    controllers: [ImageGenerationController],
})
export class ImageGenerationModule {}
