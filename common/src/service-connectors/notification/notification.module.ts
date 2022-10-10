import {Inject, Module} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";

import {GlobalModule} from "../../global.module";
import {CommonClient} from "../../global.types";
import {UtilModule} from "../../util/util.module";
import {NotificationService} from "./notification.service";

@Module({
    imports: [GlobalModule, UtilModule],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {
    constructor(
        @Inject(CommonClient.Notification)
        private notificationClient: ClientProxy,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.notificationClient.connect();
    }
}
