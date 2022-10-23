import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import * as models from "./models";
import * as repositories from "./repositories";

const ormModule = TypeOrmModule.forFeature(Object.values(models));
const providers = Object.values(repositories);

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class FranchiseModule {}
