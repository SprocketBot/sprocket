import {Module} from "@nestjs/common";
import { MinioModule } from "@sprocketbot/common";

import {ImageGenerationModule} from "./image-generation/image-generation.module";

@Module({
    imports: [ImageGenerationModule],
    providers: [],
    controllers: [],
})
export class AppModule {}
