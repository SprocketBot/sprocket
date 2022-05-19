import {Module} from "@nestjs/common";
import {ImageGenerationService} from "@sprocketbot/common";
import {DatabaseModule} from "src/database";


@Module({
    imports: [DatabaseModule],
    providers: [ImageGenerationService],
    exports: [ImageGenerationService],
})
export class SchedulingModule {}
