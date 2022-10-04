import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {Webhook} from "./webhook";

export const webhookEntities = [
    Webhook,
];

const ormModule = TypeOrmModule.forFeature(webhookEntities);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],
})
export class WebhookModule {}
