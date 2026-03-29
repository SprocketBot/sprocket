import {Module} from "@nestjs/common";

import {HealthController} from "./health.controller";
import {ImageGenerationModule} from "./image-generation/image-generation.module";

@Module({
    imports: [ImageGenerationModule],
    providers: [],
    controllers: [HealthController],
})
export class AppModule {}
