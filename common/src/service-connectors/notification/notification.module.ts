import {Module} from "@nestjs/common";

import {UtilModule} from "../../util/util.module";
import {NotificationService} from "./notification.service";

@Module({
    imports: [UtilModule],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
