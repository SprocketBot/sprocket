import {Module} from "@nestjs/common";

import {IdentityDatabaseModule} from "./database/identity-database.module";
import {UserController} from "./user/user.controller";
import {UserResolver} from "./user/user.resolver";

@Module({
    imports: [IdentityDatabaseModule],
    controllers: [UserController],
    providers: [UserResolver],
})
export class IdentityModule {}
