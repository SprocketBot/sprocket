import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {EligibilityData} from "./eligibility_data";
import {Invalidation} from "./invalidation";
import {Match} from "./match";
import {MatchParent} from "./match_parent";
import {PlayerStatLine} from "./player_stat_line";
import {Round} from "./round";
import {ScrimMeta} from "./saved_scrim";
import {ScheduleFixture} from "./schedule_fixture";
import {ScheduleGroup} from "./schedule_group";
import {ScheduleGroupType} from "./schedule_group_type";
import {ScheduledEvent} from "./scheduled_event";
import {TeamStatLine} from "./team_stat_line";

export const schedulingEntities = [
    EligibilityData,
    Invalidation,
    MatchParent,
    Match,
    Round,
    PlayerStatLine,
    ScheduleFixture,
    ScheduleGroupType,
    ScheduleGroup,
    ScheduledEvent,
    ScrimMeta,
    TeamStatLine,
];

const ormModule = TypeOrmModule.forFeature(schedulingEntities);

@Module({
    imports: [ormModule],
    exports: [ormModule],
})
export class SchedulingModule {}
