import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {ImageTemplate} from "./image_template";

export const imageGenerationEntities = [
    ImageTemplate,
];

const ormModule = TypeOrmModule.forFeature(imageGenerationEntities);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],

})
export class ImageGenModule {}
