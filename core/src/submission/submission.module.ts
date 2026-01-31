import {Module} from "@nestjs/common";
import {SubmissionModule as CommonSubmissionModule} from "@sprocketbot/common";

import {SubmissionService} from "./submission.service";
import {SubmissionManagementResolver} from "./submission-management/submission-management.resolver";

@Module({
    imports: [CommonSubmissionModule],
    providers: [SubmissionManagementResolver, SubmissionService],
})
export class SubmissionModule {}
