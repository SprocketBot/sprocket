import {Module} from "@nestjs/common";

import {GlobalModule} from "../../global.module";
import {SubmissionService} from "./submission.service";

@Module({
    imports: [GlobalModule],
    providers: [SubmissionService],
    exports: [SubmissionService],
})
export class SubmissionModule {}
