import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {DraftPick} from "./draft_pick";
import {DraftSelection} from "./draft_selection";

export const draftEntities = [
    DraftPick,
    DraftSelection,
];

const ormModule = TypeOrmModule.forFeature(draftEntities);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],
})
export class DraftModule {
}
