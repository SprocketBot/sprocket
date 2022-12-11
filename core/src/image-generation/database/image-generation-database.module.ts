import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {ImageTemplate} from "./image-template.entity";
import {ImageTemplateRepository} from "./image-template.repository";

const ormModule = TypeOrmModule.forFeature([ImageTemplate]);

const providers = [ImageTemplateRepository];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class ImageGenerationDatabaseModule {}
