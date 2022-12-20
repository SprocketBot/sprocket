import {Module} from "@nestjs/common";

import {WebhookDatabaseModule} from "./database/webhook-database.module";

@Module({
    imports: [WebhookDatabaseModule],
})
export class WebhookModule {}
