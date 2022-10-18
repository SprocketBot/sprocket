/* eslint-disable @typescript-eslint/naming-convention */
import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {EventsModule} from "@sprocketbot/common";

import * as models from "./models";
import * as repositories from "./repositories";

const ormModule = TypeOrmModule.forFeature(Object.values(models));
const moduleRepositories = Object.values(repositories);

@Module({
    imports: [ormModule, EventsModule],
    providers: moduleRepositories,
    exports: moduleRepositories,
})
export class OrganizationModule {}
