import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {IdentityService} from "./identity.service";
import {UserResolver} from "./user/user.resolver";
import {UserService} from "./user/user.service";
import {UserAuthenticationAccountResolver} from "./user-authentication-account/user-authentication-account.resolver";

@Module({
    imports: [DatabaseModule],
    providers: [IdentityService, UserResolver, UserAuthenticationAccountResolver, UserService],
    controllers: [],
    exports: [UserService],
})
export class IdentityModule {}
