import {Module} from "@nestjs/common";

import {GqlService} from "./gql.service";

@Module({
    providers: [GqlService],
    exports: [GqlService],
})
export class GqlModule {}
