import {Module} from "@nestjs/common";
import {ImageGenerationModule as CommonImageGenerationModule} from "@sprocketbot/common";

import {ImageGenerationDatabaseModule} from "./database/image-generation-database.module";
import {ImageGenerationController} from "./image-generation.controller";
import {ImageGenerationService} from "./image-generation.service";

@Module({
    imports: [CommonImageGenerationModule, ImageGenerationDatabaseModule],
    controllers: [ImageGenerationController],
    providers: [ImageGenerationService],
})
export class ImageGenerationModule {}
