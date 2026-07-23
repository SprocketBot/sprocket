import {forwardRef, Module} from "@nestjs/common";
import {
    CeleryModule,
    CoreModule,
    EventsModule,
    MatchmakingModule,
    MinioModule,
    PostgresModule,
} from "@sprocketbot/common";

import {ReplayValidationModule} from "../replay-validation/replay-validation.module";
import {CrossFranchiseValidationService} from "./cross-franchise-validation.service";
import {ReplayParseSubscriber} from "./parse-subscriber/replay-parse.subscriber";
import {ReplaySubmissionPostgresRepository} from "./persistence/replay-submission-postgres.repository";
import {ReplaySubmissionService} from "./replay-submission.service";
import {ReplaySubmissionCrudController} from "./replay-submission-crud/replay-submission-crud.controller";
import {ReplaySubmissionCrudService} from "./replay-submission-crud/replay-submission-crud.service";
import {
    ReplaySubmissionRatificationController,
    ReplaySubmissionRatificationService,
} from "./replay-submission-ratification";
import {ReplaySubmissionUtilService} from "./replay-submission-util.service";
import {ReplayUploadController} from "./replay-upload.controller";
import {StatsConverterService} from "./stats-converter/stats-converter.service";

@Module({
    imports: [
        PostgresModule,
        MatchmakingModule,
        EventsModule,
        MinioModule,
        CeleryModule,
        forwardRef(() => ReplayValidationModule),
        CoreModule,
    ],
    providers: [
        ReplaySubmissionService,
        ReplaySubmissionCrudService,
        ReplaySubmissionUtilService,
        ReplayParseSubscriber,
        ReplaySubmissionRatificationService,
        CrossFranchiseValidationService,
        StatsConverterService,
        ReplaySubmissionPostgresRepository,
    ],
    controllers: [
        ReplayUploadController,
        ReplaySubmissionRatificationController,
        ReplaySubmissionCrudController,
    ],
    exports: [ReplaySubmissionCrudService],
})
export class ReplaySubmissionModule {}
