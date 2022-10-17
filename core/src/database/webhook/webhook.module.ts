import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {Webhook, WebhookRepository} from "./webhook";

export const webhookEntities = [Webhook];

const ormModule = TypeOrmModule.forFeature(webhookEntities);

@Module({
    imports: [ormModule],
    providers: [WebhookRepository],
    exports: [ormModule, WebhookRepository],
})
export class WebhookModule {}
