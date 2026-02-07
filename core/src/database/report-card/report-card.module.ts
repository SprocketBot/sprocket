import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {ReportCardAsset} from "./report_card_asset.model";

export const reportCardEntities = [ReportCardAsset];

const ormModule = TypeOrmModule.forFeature(reportCardEntities);

@Module({
    imports: [ormModule],
    exports: [ormModule],
})
export class ReportCardDbModule {}
