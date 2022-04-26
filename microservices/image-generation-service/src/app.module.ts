import {Module} from "@nestjs/common";

import {GlobalModule} from "./global.module";
import {ImageGenerationModule} from "./image-generation/image-generation.module";

@Module({
    imports: [GlobalModule, ImageGenerationModule],
    providers: [GlobalModule],
    controllers: [],
})
export class AppModule {}
