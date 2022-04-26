import {Module} from "@nestjs/common";

import {IgActionsController} from "./ig-actions/ig-actions.controller";
import {ImageGenerationService} from "./image-generation.service";
import {SvgTransformationService} from "./svg-transformation/svg-transformation.service";

@Module({
    providers: [ImageGenerationService, SvgTransformationService],
    controllers: [IgActionsController],
})
export class ImageGenerationModule {}
