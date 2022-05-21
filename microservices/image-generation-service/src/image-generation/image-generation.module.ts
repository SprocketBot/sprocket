import {Module} from "@nestjs/common";
import { MinioModule } from "@sprocketbot/common";

import {IgActionsController} from "./ig-actions/ig-actions.controller";
import { ImageGenerationController } from "./image-generation.controller";
import {ImageGenerationService} from "./image-generation.service";
import {SvgTransformationService} from "./svg-transformation/svg-transformation.service";

@Module({
    imports: [MinioModule],
    providers: [ImageGenerationService, SvgTransformationService],
    controllers: [ImageGenerationController, IgActionsController],
})
export class ImageGenerationModule {}
