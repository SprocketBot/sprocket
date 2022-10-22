import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {AuthorizationResolver} from "./authorization.resolver";
import {AuthorizationService} from "./authorization.service";

@Module({
    imports: [DatabaseModule],
    providers: [AuthorizationService, AuthorizationResolver],
})
export class AuthorizationModule {}
