import {Module} from "@nestjs/common";

import {MemberModule} from "./member/member.module";
import {ScrimModule} from "./scrim/scrim.module";

@Module({
    imports: [ScrimModule, MemberModule],
})
export class AppModule {}
