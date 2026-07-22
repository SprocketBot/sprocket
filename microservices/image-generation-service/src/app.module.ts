import {Module} from "@nestjs/common";
import {PostgresModule} from "@sprocketbot/common";

import {HealthController} from "./health.controller";
import {ImageGenerationModule} from "./image-generation/image-generation.module";

@Module({
    imports: [ImageGenerationModule, PostgresModule],
    providers: [],
    controllers: [HealthController],
})
export class AppModule {}
