import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {EligibilityData} from "./eligibility-data.entity";
import {EligibilityDataRepository} from "./eligibility-data.repository";
import {Invalidation} from "./invalidation.entity";
import {InvalidationRepository} from "./invalidation.repository";
import {Match} from "./match.entity";
import {MatchRepository} from "./match.repository";
import {MatchParent} from "./match-parent.entity";
import {MatchParentRepository} from "./match-parent.repository";
import {PlayerStatLine} from "./player-stat-line.entity";
import {PlayerStatLineRepository} from "./player-stat-line.repository";
import {Round} from "./round.entity";
import {RoundRepository} from "./round.repository";
import {ScheduleFixture} from "./schedule-fixture.entity";
import {ScheduleFixtureRepository} from "./schedule-fixture.repository";
import {ScheduleGroup} from "./schedule-group.entity";
import {ScheduleGroupRepository} from "./schedule-group.repository";
import {ScheduleGroupType} from "./schedule-group-type.entity";
import {ScheduleGroupTypeRepository} from "./schedule-group-type.repository";
import {ScheduledEvent} from "./scheduled-event.entity";
import {ScheduledEventRepository} from "./scheduled-event.repository";
import {ScrimMeta} from "./scrim-meta.entity";
import {ScrimMetaRepository} from "./scrim-meta.repository";
import {TeamStatLine} from "./team-stat-line.entity";
import {TeamStatLineRepository} from "./team-stat-line.repository";

const ormModule = TypeOrmModule.forFeature([
    EligibilityData,
    Invalidation,
    Match,
    MatchParent,
    PlayerStatLine,
    Round,
    ScheduleFixture,
    ScheduleGroup,
    ScheduleGroupType,
    ScheduledEvent,
    ScrimMeta,
    TeamStatLine,
]);

const providers = [
    EligibilityDataRepository,
    InvalidationRepository,
    MatchRepository,
    MatchParentRepository,
    PlayerStatLineRepository,
    RoundRepository,
    ScheduleFixtureRepository,
    ScheduleGroupRepository,
    ScheduleGroupTypeRepository,
    ScheduledEventRepository,
    ScrimMetaRepository,
    TeamStatLineRepository,
];

@Module({
    imports: [ormModule],
    providers: providers,
    exports: providers,
})
export class SchedulingDatabaseModule {}
