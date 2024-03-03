import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {ImageTemplate} from "./image_template";

export const configurationEntities = [
    ImageTemplate,
];

const ormModule = TypeOrmModule.forFeature(configurationEntities);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],

})
export class ImageGenModule {}
