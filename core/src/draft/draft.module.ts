import {Module} from "@nestjs/common";

import {DraftDatabaseModule} from "./database/draft-database.module";

@Module({imports: [DraftDatabaseModule]})
export class DraftModule {}
