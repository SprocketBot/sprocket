import {Module} from "@nestjs/common";
import {
    MatchmakingModule, RedisModule,
} from "@sprocketbot/common";

import {ReplayUploadController} from "./replay-upload.controller";
import {ReplayUploadService} from "./replay-upload.service";

@Module({
    imports: [RedisModule, MatchmakingModule],
    providers: [ReplayUploadService],
    controllers: [ReplayUploadController],
})
export class ReplayUploadModule {}
