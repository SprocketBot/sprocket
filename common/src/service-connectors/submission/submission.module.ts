import {Module} from "@nestjs/common";

import {UtilModule} from "../../util/util.module";
import {SubmissionService} from "./submission.service";

@Module({
    imports: [UtilModule],
    providers: [SubmissionService],
    exports: [SubmissionService],
})
export class SubmissionModule {}
