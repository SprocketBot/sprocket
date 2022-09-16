import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {FranchiseWebhook} from "./franchise_webhook";
import {GameSkillGroupWebhook} from "./game_skill_group_webhook";
import {Webhook} from "./webhook";

export const webhookEntities = [
    Webhook,
    FranchiseWebhook,
    GameSkillGroupWebhook,
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
