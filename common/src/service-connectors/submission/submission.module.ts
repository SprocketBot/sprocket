import {Module} from "@nestjs/common";

import {SubmissionService} from "./submission.service";

@Module({
    providers: [SubmissionService],
    exports: [SubmissionService],
})
export class SubmissionModule {}
