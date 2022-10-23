import {forwardRef, Module} from "@nestjs/common";
import {EventsModule} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {ConfigurationModule} from "../configuration";
import {DatabaseModule} from "../database";
import {UtilModule} from "../util/util.module";
import {MemberPubSub} from "./constants";
import {MemberController, MemberResolver, MemberService} from "./member";
import {MemberRestrictionResolver, QueueBanGuard} from "./member-restriction/";
import {OrganizationController, OrganizationResolver} from "./organization";

@Module({
    imports: [DatabaseModule, EventsModule, forwardRef(() => ConfigurationModule), UtilModule],
    providers: [
        {
            provide: MemberPubSub,
            useValue: new PubSub(),
        },
        OrganizationResolver,
        MemberService,
        MemberRestrictionResolver,
        QueueBanGuard,
        MemberResolver,
    ],
    exports: [MemberService, QueueBanGuard],
    controllers: [OrganizationController, MemberController],
})
export class OrganizationModule {}
