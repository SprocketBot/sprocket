import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {ReportCardAsset} from "../database/report-card/report_card_asset.model";
import {ReportCardController} from "./report-card.controller";
import {ReportCardService} from "./report-card.service";

@Module({
    imports: [TypeOrmModule.forFeature([ReportCardAsset])],
    providers: [ReportCardService],
    controllers: [ReportCardController],
    exports: [ReportCardService],
})
export class ReportCardModule {}
