import {Module} from "@nestjs/common";

import {DatabaseModule} from "../database";
import {IdentityService} from "./identity.service";
import {UserResolver, UserService} from "./user";
import {UserAuthenticationAccountResolver} from "./user-authentication-account";

@Module({
    imports: [DatabaseModule],
    providers: [
        IdentityService,
        UserResolver,
        UserAuthenticationAccountResolver,
        UserService,
    ],
    exports: [IdentityService, UserService],
})
export class IdentityModule {}
