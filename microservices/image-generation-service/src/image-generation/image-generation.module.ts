import {Module} from "@nestjs/common";

import {IgActionsController} from "./ig-actions/ig-actions.controller";
import { ImageGenerationController } from "./image-generation.controller";
import {ImageGenerationService} from "./image-generation.service";
import {SvgTransformationService} from "./svg-transformation/svg-transformation.service";

@Module({
    providers: [ImageGenerationService, SvgTransformationService],
    controllers: [ImageGenerationController, IgActionsController],
})
export class ImageGenerationModule {}
