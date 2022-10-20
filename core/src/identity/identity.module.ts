import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {UtilModule} from "../util/util.module";
import {IdentityController} from "./identity.controller";
import {UserController, UserResolver} from "./user";
import {UserAuthenticationAccountResolver} from "./user-authentication-account";

@Module({
    imports: [DatabaseModule, UtilModule],
    providers: [UserResolver, UserAuthenticationAccountResolver],
    controllers: [IdentityController, UserController],
})
export class IdentityModule {}
