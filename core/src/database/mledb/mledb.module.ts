import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChannelMap} from "./ChannelMap";
import {Config} from "./Config";
import {Division} from "./Division";
import {DraftOrder} from "./DraftOrder";
import {EligibilityData} from "../scheduling";
import {EloData} from "./EloData";
import {Fixture} from "./Fixture";
import {Footers} from "./Footers";
import {LeagueBranding} from "./LeagueBranding";
import {Match} from "./Match";
import {Player} from "./Player";
import {PlayerAccount} from "./PlayerAccount";
import {PlayerHistory} from "./PlayerHistory";
import {PlayerStats} from "./PlayerStats";
import {PlayerStatsCore} from "./PlayerStatsCore";
import {PlayerToOrg} from "./PlayerToOrg";
import {PsyonixApiResult} from "./PsyonixApiResult";
import {SalaryCap} from "./SalaryCap";
import {Scrim} from "./Scrim";
import {Season} from "./Season";
import {Series} from "./Series";
import {SeriesReplay} from "./SeriesReplay";
import {StreamEvent} from "./StreamEvent";
import {Team} from "./Team";
import {TeamBranding} from "./TeamBranding";
import {TeamCoreStats} from "./TeamCoreStats";
import {TeamRoleUsage} from "./TeamRoleUsage";
import {TeamToCaptain} from "./TeamToCaptain";

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

const ormModule = TypeOrmModule.forFeature();

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
