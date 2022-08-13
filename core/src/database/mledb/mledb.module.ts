import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {mledbConnectionName} from "../database.module";
import {MLE_ChannelMap} from "./ChannelMap.model";
import {MLE_Config} from "./Config.model";
import {MLE_Division} from "./Division.model";
import {MLE_DraftOrder} from "./DraftOrder.model";
import {MLE_EligibilityData} from "./EligibilityData.model";
import {MLE_EloData} from "./EloData.model";
import {MLE_Fixture} from "./Fixture.model";
import {MLE_Footers} from "./Footers.model";
import {MLE_LeagueBranding} from "./LeagueBranding.model";
import {MLE_Match} from "./Match.model";
import {MLE_Player} from "./Player.model";
import {MLE_PlayerAccount} from "./PlayerAccount.model";
import {MLE_PlayerHistory} from "./PlayerHistory.model";
import {MLE_PlayerStats} from "./PlayerStats.model";
import {MLE_PlayerStatsCore} from "./PlayerStatsCore.model";
import {MLE_PlayerToOrg} from "./PlayerToOrg.model";
import {MLE_PsyonixApiResult} from "./PsyonixApiResult.model";
import {MLE_SalaryCap} from "./SalaryCap.model";
import {MLE_Scrim} from "./Scrim.model";
import {MLE_Season} from "./Season.model";
import {MLE_Series} from "./Series.model";
import {MLE_SeriesReplay} from "./SeriesReplay.model";
import {MLE_StreamEvent} from "./StreamEvent.model";
import {MLE_Team} from "./Team.model";
import {MLE_TeamBranding} from "./TeamBranding.model";
import {MLE_TeamCoreStats} from "./TeamCoreStats.model";
import {MLE_TeamRoleUsage} from "./TeamRoleUsage.model";
import {MLE_TeamToCaptain} from "./TeamToCaptain.model";

export const mledbEntities = [
    MLE_ChannelMap,
    MLE_Config,
    MLE_Division,
    MLE_DraftOrder,
    MLE_EligibilityData,
    MLE_EloData,
    MLE_Fixture,
    MLE_Footers,
    MLE_LeagueBranding,
    MLE_Match,
    MLE_Player,
    MLE_PlayerAccount,
    MLE_PlayerHistory,
    MLE_PlayerStats,
    MLE_PlayerStatsCore,
    MLE_PlayerToOrg,
    MLE_PsyonixApiResult,
    MLE_SalaryCap,
    MLE_Scrim,
    MLE_Season,
    MLE_Series,
    MLE_SeriesReplay,
    MLE_StreamEvent,
    MLE_Team,
    MLE_TeamBranding,
    MLE_TeamCoreStats,
    MLE_TeamRoleUsage,
    MLE_TeamToCaptain,
];

const ormModule = TypeOrmModule.forFeature(mledbEntities, mledbConnectionName);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],
})
export class MledbModule {
}
