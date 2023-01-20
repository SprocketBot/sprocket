import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {Webhook} from "./webhook.entity";
import {WebhookRepository} from "./webhook.repository";

const ormModule = TypeOrmModule.forFeature([Webhook]);

const providers = [WebhookRepository];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class WebhookDatabaseModule {}
