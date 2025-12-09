import { Module } from "@nestjs/common";
import { MinioModule } from "@sprocketbot/common/lib/minio/minio.module";

import { ImageGenerationController } from "./image-generation.controller";
import { ImageGenerationService } from "./image-generation.service";
import { SvgTransformationService } from "./svg-transformation/svg-transformation.service";

@Module({
    imports: [MinioModule],
    providers: [ImageGenerationService, SvgTransformationService],
    controllers: [ImageGenerationController],
    exports: [ImageGenerationService],
})
export class ImageGenerationModule { }
