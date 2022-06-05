import {Module} from "@nestjs/common";

import {ScrimModule} from "./scrim/scrim.module";

@Module({
    imports: [ScrimModule],
})
export class AppModule {}
