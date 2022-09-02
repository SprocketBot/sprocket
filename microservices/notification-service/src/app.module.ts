import {Module} from "@nestjs/common";

import {MatchModule} from "./match/match.module";
import {MemberModule} from "./member/member.module";
import {NotificationModule} from "./notification/notification.module";
import {ScrimModule} from "./scrim/scrim.module";
import {SubmissionModule} from "./submission/submission.module";

@Module({
    imports: [
        ScrimModule,
        MemberModule,
        SubmissionModule,
        MatchModule,
        NotificationModule,
    ],
})
export class AppModule {}
