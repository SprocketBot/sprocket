import {Module} from "@nestjs/common";

import {UtilModule} from "../util/util.module";
import {AuthenticationModule} from "./authentication";
import {AuthorizationModule} from "./authorization/authorization.module";
import {ConfigurationModule} from "./configuration";
import {EloModule} from "./elo";
import {FranchiseModule} from "./franchise";
import {GameModule} from "./game";
import {IdentityModule} from "./identity";
import {ImageGenerationModule} from "./image-generation";
import {MledbInterfaceModule} from "./mledb";
import {NotificationModule} from "./notification/notification.module";
import {OrganizationModule} from "./organization";
import {ReplayParseModule} from "./replay-parse";
import {SchedulingModule} from "./scheduling";
import {ScrimModule} from "./scrim";
import {SprocketRatingModule} from "./sprocket-rating";
import {SubmissionModule} from "./submission";

@Module({
    imports: [
        AuthenticationModule,
        OrganizationModule,
        IdentityModule,
        ConfigurationModule,
        GameModule,
        ReplayParseModule,
        ScrimModule,
        SchedulingModule,
        MledbInterfaceModule,
        FranchiseModule,
        ImageGenerationModule,
        SprocketRatingModule,
        UtilModule,
        EloModule,
        SubmissionModule,
        NotificationModule,
        AuthorizationModule,
    ],
})
export class InternalModule {}
