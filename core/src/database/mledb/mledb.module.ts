import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChannelMap} from "./ChannelMap.model";
import {Config} from "./Config.model";
import {Division} from "./Division.model";
import {DraftOrder} from "./DraftOrder.model";
import {EligibilityData} from "./EligibilityData.model";
import {EloData} from "./EloData.model";
import {Fixture} from "./Fixture.model";
import {Footers} from "./Footers.model";
import {LeagueBranding} from "./LeagueBranding.model";
import {Match} from "./Match.model";
import {Player} from "./Player.model";
import {PlayerAccount} from "./PlayerAccount.model";
import {PlayerHistory} from "./PlayerHistory.model";
import {PlayerStats} from "./PlayerStats.model";
import {PlayerStatsCore} from "./PlayerStatsCore.model";
import {PlayerToOrg} from "./PlayerToOrg.model";
import {PsyonixApiResult} from "./PsyonixApiResult.model";
import {SalaryCap} from "./SalaryCap.model";
import {Scrim} from "./Scrim.model";
import {Season} from "./Season.model";
import {Series} from "./Series.model";
import {SeriesReplay} from "./SeriesReplay.model";
import {StreamEvent} from "./StreamEvent.model";
import {Team} from "./Team.model";
import {TeamBranding} from "./TeamBranding.model";
import {TeamCoreStats} from "./TeamCoreStats.model";
import {TeamRoleUsage} from "./TeamRoleUsage.model";
import {TeamToCaptain} from "./TeamToCaptain.model";

export const mledbEntities = [
    ChannelMap,
    Config,
    Division,
    DraftOrder,
    EligibilityData,
    EloData,
    Fixture,
    Footers,
    LeagueBranding,
    Match,
    Player,
    PlayerAccount,
    PlayerHistory,
    PlayerStats,
    PlayerStatsCore,
    PlayerToOrg,
    PsyonixApiResult,
    SalaryCap,
    Scrim,
    Season,
    Series,
    SeriesReplay,
    StreamEvent,
    Team,
    TeamBranding,
    TeamCoreStats,
    TeamRoleUsage,
    TeamToCaptain
]

const ormModule = TypeOrmModule.forFeature(mledbEntities);

@Module({
    imports: [
        ormModule
    ],
    exports: [
        ormModule
    ]
})
export class MledbModule {
}
