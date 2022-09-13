import {Module} from "@nestjs/common";

import {GlobalModule} from "../../global.module";
import {UtilModule} from "../../util/util.module";
import {ImageGenerationService} from "./image-generation.service";

@Module({
    providers: [ImageGenerationService],
    exports: [ImageGenerationService],
    imports: [GlobalModule, UtilModule],
})
export class ImageGenerationModule {}
