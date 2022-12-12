import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";

@Module({
    imports: [BullModule.registerQueue({name: "scrim"})],
})
export class SchedulingModule {}
