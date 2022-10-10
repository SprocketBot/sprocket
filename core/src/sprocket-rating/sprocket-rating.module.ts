import {Module} from "@nestjs/common";

import {SprocketRatingService} from "./sprocket-rating.service";

@Module({
    providers: [SprocketRatingService],
    exports: [SprocketRatingService],
})
export class SprocketRatingModule {}
