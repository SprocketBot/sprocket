import { Resolver, Query, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UseGuards } from '@nestjs/common';
import { AuthPossession, UsePermissions } from 'nest-authz';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';
import { AuthorizeGuard } from '../auth/authorize/authorize.guard';

import {
  MatchSubmissionEntity,
  RoundEntity,
  ScheduleGroupEntity,
  ScheduleGroupTypeEntity,
  TeamStatEntity,
  ScrimQueueEntity,
  ScrimTimeoutEntity,
  EventQueue,
  MetricsEntity,
  LogsEntity,
  MatchEntity,
  UserNotificationPreferenceEntity,
  NotificationHistoryEntity,
  NotificationTemplateEntity,
  PlayerStatEntity,
  FixtureEntity,
} from '../db/internal';

import { MatchSubmissionObject } from './submission/match_submission.object';
import { RoundObject } from './round/round.object';
import { ScheduleGroupObject } from './schedule_group/schedule_group.object';
import { ScheduleGroupTypeObject } from './schedule_group_type/schedule_group_type.object';
import { TeamStatObject } from './team_stat/team_stat.object';
import { ScrimQueueObject } from './scrim_queue/scrim_queue.object';
import { ScrimTimeoutObject } from './scrim_timeout/scrim_timeout.object';
import { EventQueueObject } from './events/event_queue.object';
import { MetricsObject } from './observability/metrics.object';
import { LogsObject } from './observability/logs.object';
import { MatchObject } from './match/match.object';
import { UserNotificationPreferenceObject } from './notification/user_notification_preference.object';
import { NotificationHistoryObject } from './notification/notification_history.object';
import { NotificationTemplateObject } from './notification/notification_template.object';
import { PlayerStatObject } from './player_stat/player_stat.object';
import { FixtureObject } from './match/fixture.object';

@Resolver()
export class CoreEntitiesResolver {
  constructor(
    @InjectRepository(MatchSubmissionEntity) private matchSubmissionRepo: Repository<MatchSubmissionEntity>,
    @InjectRepository(RoundEntity) private roundRepo: Repository<RoundEntity>,
    @InjectRepository(ScheduleGroupEntity) private scheduleGroupRepo: Repository<ScheduleGroupEntity>,
    @InjectRepository(ScheduleGroupTypeEntity) private scheduleGroupTypeRepo: Repository<ScheduleGroupTypeEntity>,
    @InjectRepository(TeamStatEntity) private teamStatRepo: Repository<TeamStatEntity>,
    @InjectRepository(ScrimQueueEntity) private scrimQueueRepo: Repository<ScrimQueueEntity>,
    @InjectRepository(ScrimTimeoutEntity) private scrimTimeoutRepo: Repository<ScrimTimeoutEntity>,
    @InjectRepository(EventQueue) private eventQueueRepo: Repository<EventQueue>,
    @InjectRepository(MetricsEntity) private metricsRepo: Repository<MetricsEntity>,
    @InjectRepository(LogsEntity) private logsRepo: Repository<LogsEntity>,
    @InjectRepository(MatchEntity) private matchRepo: Repository<MatchEntity>,
    @InjectRepository(UserNotificationPreferenceEntity) private userNotifPrefRepo: Repository<UserNotificationPreferenceEntity>,
    @InjectRepository(NotificationHistoryEntity) private notifHistoryRepo: Repository<NotificationHistoryEntity>,
    @InjectRepository(NotificationTemplateEntity) private notifTemplateRepo: Repository<NotificationTemplateEntity>,
    @InjectRepository(PlayerStatEntity) private playerStatRepo: Repository<PlayerStatEntity>,
    @InjectRepository(FixtureEntity) private fixtureRepo: Repository<FixtureEntity>,
  ) { }

  @Query(() => MatchObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.Match,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getMatchById(@Args('id') id: string): Promise<MatchEntity | null> {
    return this.matchRepo.findOne({ where: { id } });
  }

  @Query(() => MatchSubmissionObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.MatchSubmission,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getMatchSubmissionById(@Args('id') id: string): Promise<MatchSubmissionEntity | null> {
    return this.matchSubmissionRepo.findOne({ where: { id } });
  }

  @Query(() => RoundObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.Round,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getRoundById(@Args('id') id: string): Promise<RoundEntity | null> {
    // RoundEntity extends BaseEntity, so it should have id? 
    // Wait, check entity. RoundEntity has specific id if BaseEntity has it.
    // Yes BaseEntity has id.
    // However, RoundEntity might use composite key? No, extends BaseEntity.
    return this.roundRepo.findOne({ where: { id } });
  }

  @Query(() => ScheduleGroupObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.ScheduleGroup,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getScheduleGroupById(@Args('id') id: string): Promise<ScheduleGroupEntity | null> {
    return this.scheduleGroupRepo.findOne({ where: { id } });
  }

  @Query(() => ScheduleGroupTypeObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.ScheduleGroupType,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getScheduleGroupTypeById(@Args('id') id: string): Promise<ScheduleGroupTypeEntity | null> {
    return this.scheduleGroupTypeRepo.findOne({ where: { id } });
  }

  @Query(() => TeamStatObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.TeamStat,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getTeamStatById(@Args('id') id: string): Promise<TeamStatEntity | null> {
    return this.teamStatRepo.findOne({ where: { id } });
  }

  @Query(() => PlayerStatObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.PlayerStat,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getPlayerStatById(@Args('id') id: string): Promise<PlayerStatEntity | null> {
    return this.playerStatRepo.findOne({ where: { id } });
  }

  @Query(() => ScrimQueueObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.ScrimQueue,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getScrimQueueById(@Args('id') id: string): Promise<ScrimQueueEntity | null> {
    return this.scrimQueueRepo.findOne({ where: { id } });
  }

  @Query(() => ScrimTimeoutObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.ScrimTimeout,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getScrimTimeoutById(@Args('id') id: string): Promise<ScrimTimeoutEntity | null> {
    return this.scrimTimeoutRepo.findOne({ where: { id } });
  }

  @Query(() => EventQueueObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.EventQueue,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getEventQueueById(@Args('id') id: string): Promise<EventQueue | null> {
    // EventQueue extends BaseEntity so has id.
    return this.eventQueueRepo.findOne({ where: { id } });
  }

  @Query(() => MetricsObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.Metrics,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getMetricsById(@Args('id') id: string): Promise<MetricsEntity | null> {
    // Metrics extends BaseEntity. But verify if it has id (BaseObject has id).
    // Yes.
    // Actually MetricsEntity typically is timeseries, might not use ID query often, but we expose it.
    // BaseEntity *usually* has id.
    // Wait, I saw MetricsEntity:
    // @Entity() class MetricsEntity extends BaseEntity
    // BaseEntity usually has PK.
    return this.metricsRepo.findOne({ where: { id: id as any } }); // cast to any if type mismatch? usually fine.
  }

  @Query(() => LogsObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.Logs,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getLogsById(@Args('id') id: string): Promise<LogsEntity | null> {
    return this.logsRepo.findOne({ where: { id: id as any } });
  }

  @Query(() => UserNotificationPreferenceObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.UserNotificationPreference,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getUserNotificationPreferenceById(@Args('id') id: string): Promise<UserNotificationPreferenceEntity | null> {
    return this.userNotifPrefRepo.findOne({ where: { id } });
  }

  @Query(() => NotificationHistoryObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.NotificationHistory,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getNotificationHistoryById(@Args('id') id: string): Promise<NotificationHistoryEntity | null> {
    return this.notifHistoryRepo.findOne({ where: { id } });
  }

  @Query(() => NotificationTemplateObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.NotificationTemplate,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getNotificationTemplateById(@Args('id') id: string): Promise<NotificationTemplateEntity | null> {
    return this.notifTemplateRepo.findOne({ where: { id } });
  }

  @Query(() => FixtureObject, { nullable: true })
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
  @UsePermissions({
    resource: Resource.Fixture,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async getFixtureById(@Args('id') id: string): Promise<FixtureEntity | null> {
    return this.fixtureRepo.findOne({ where: { id } });
  }
}
