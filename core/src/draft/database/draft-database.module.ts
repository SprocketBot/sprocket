import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {DraftPick} from "./draft-pick.entity";
import {DraftPickRepository} from "./draft-pick.repository";
import {DraftSelection} from "./draft-selection.entity";
import {DraftSelectionRepository} from "./draft-selection.repository";

const ormModule = TypeOrmModule.forFeature([DraftPick, DraftSelection]);

const providers = [DraftPickRepository, DraftSelectionRepository];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class DraftDatabaseModule {}
