import {Module} from "@nestjs/common";

import {DatabaseModule} from "../../database";
import {AuthorizationService} from "./authorization.service";

@Module({
    imports: [DatabaseModule],
    providers: [AuthorizationService],
})
export class AuthorizationModule {}
