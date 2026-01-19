import {
  Args,
  Mutation,
  ResolveField,
  Resolver,
  Root,
  Subscription,
  Query,
  Int,
} from '@nestjs/graphql';
import type { User } from '@sprocketbot/lib/types';
import { ScrimObject, ScrimParticipantObject } from './scrim.object';
import {
  MatchmakingEvents,
  type Scrim,
} from '../../matchmaking/connector/matchmaking.connector';
import { ScrimService as InternalScrimService } from '../../matchmaking/scrim/scrim.service';
import { CurrentUser } from 'src/auth/current-user/current-user.decorator';
import { Inject, UseGuards } from '@nestjs/common';
import { AuthorizeGuard } from 'src/auth/authorize/authorize.guard';
import { AuthPossession, UsePermissions } from 'nest-authz';
import {
  CreateScrimInput,
  DestroyScrimInput,
  ListScrimsInput,
} from './objects/inputs';
import { UserRepository } from '../../db/user/user.repository';
import { GameRepository } from '../../db/game/game.repository';
import { UserObject } from '../user/user.object';
import { GameObject } from '../game/game.object';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { SkillGroupRepository } from '../../db/skill_group/skill_group.repository';
import { PlayerRepository } from '../../db/player/player.repository';
import { PubSubProvider } from '../constants';
import { PubSubEngine } from 'graphql-subscriptions';
import { ScrimState } from '../../matchmaking/constants';
import { GameModeObject } from '../game_mode/game_mode.object';
import { GameModeRepository } from '../../db/game_mode/game_mode.repository';
import { ScrimService } from './scrim.service';
import { Resource, ResourceAction } from '@sprocketbot/lib/types';

@Resolver(() => ScrimParticipantObject)
export class ScrimParticipantResolver {
  constructor(private readonly userRepo: UserRepository) { }

  @ResolveField(() => String)
  async name(@Root() root: ScrimParticipantObject) {
    if (root.name) return root.name;
    const user = await this.userRepo.findOneBy({ id: root.id });
    if (!user) throw new Error(`User not found!`);
    return user.username;
  }
}

@Resolver(() => ScrimObject)
@UseGuards(AuthorizeGuard({ action: ResourceAction.Read }))
export class ScrimResolver {
  constructor(
    private readonly scrimService: ScrimService,
    private readonly internalScrimService: InternalScrimService,
    private readonly userRepo: UserRepository,
    private readonly playerRepo: PlayerRepository,
    private readonly gameRepo: GameRepository,
    private readonly gameModeRepo: GameModeRepository,
    private readonly skillGroupRepo: SkillGroupRepository,
    @Inject(PubSubProvider)
    private readonly pubsub: PubSubEngine,
  ) { }

  @Subscription(() => ScrimObject, {
    name: 'currentScrim',
    nullable: true,
    filter: ScrimService.filterCurrentScrim,
    resolve: ScrimService.resolveScrim(true),
  })
  async currentScrimLive() {
    return this.pubsub.asyncIterator(MatchmakingEvents.ScrimUpdated);
  }

  @Subscription(() => ScrimObject, {
    name: 'pendingScrims',
    resolve: ScrimService.resolveScrim(false),
    filter: ScrimService.filterPendingScrims,
  })
  async availableScrimsLive() {
    return this.pubsub.asyncIterator(MatchmakingEvents.ScrimUpdated);
  }
  @Subscription(() => ScrimObject, {
    name: 'allScrims',
    resolve: ScrimService.resolveScrim(false),
  })
  async allScrimsLive() {
    return this.pubsub.asyncIterator(MatchmakingEvents.ScrimUpdated);
  }

  @Query(() => [ScrimObject])
  @UsePermissions({
    resource: Resource.Scrim,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async pendingScrims(
    @CurrentUser() user: User,
    @Args('admin', { nullable: true, defaultValue: false }) admin: boolean,
    @Args('query', { nullable: true }) query?: ListScrimsInput,
  ) {
    return this.scrimService.getPendingScrims(query ?? {}, user, admin);
  }

  @Query(() => [ScrimObject])
  @UsePermissions({
    resource: Resource.Scrim,
    action: ResourceAction.Read,
    possession: AuthPossession.ANY,
  })
  async allScrims(@Args('query', { nullable: true }) query?: ListScrimsInput) {
    return await this.scrimService.listScrims(query ?? {});
  }

  @Query(() => ScrimObject, { nullable: true })
  @UsePermissions({
    resource: Resource.Scrim,
    action: ResourceAction.Read,
    possession: AuthPossession.OWN,
  })
  async currentScrim(@CurrentUser() authUser: User) {
    return await this.scrimService.getScrimForUser(authUser);
  }

  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Create }))
  @UsePermissions({
    resource: Resource.Scrim,
    action: ResourceAction.Create,
    possession: AuthPossession.ANY,
  })
  async createScrim(
    @CurrentUser() user: User,
    @Args('payload', { type: () => CreateScrimInput })
    payload: CreateScrimInput,
  ): Promise<Scrim> {
    return await this.scrimService.createScrim(user, payload);
  }
  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Delete }))
  @UsePermissions({
    resource: Resource.Scrim,
    action: ResourceAction.Delete,
    possession: AuthPossession.ANY,
  })
  async destroyScrim(
    @CurrentUser() user: User,
    @Args('payload', { type: () => DestroyScrimInput })
    payload: DestroyScrimInput,
  ): Promise<Scrim> {
    return await this.scrimService.destroyScrim(user, payload);
  }

  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Update }))
  @UsePermissions({
    resource: Resource.Scrim,
    action: ResourceAction.Update,
    possession: AuthPossession.ANY,
  })
  async joinScrim(
    @CurrentUser() user: User,
    @Args('scrimId', { type: () => String }) scrimId: string,
  ): Promise<Scrim> {
    return await this.internalScrimService.joinScrim(user.id, scrimId);
  }

  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard({ action: ResourceAction.Update }))
  @UsePermissions({
    resource: Resource.Scrim,
    action: ResourceAction.Update,
    possession: AuthPossession.ANY,
  })
  async leaveScrim(@CurrentUser() user: User): Promise<Scrim> {
    return await this.internalScrimService.leaveScrim(user.id);
  }

  @ResolveField(() => Boolean)
  async complete(@Root() root: ScrimObject) {
    return [ScrimState.CANCELLED, ScrimState.COMPLETE].includes(root.state);
  }

  @ResolveField(() => UserObject)
  async author(@Root() root: Partial<ScrimObject>) {
    if (root.author) return root.author;
    return this.userRepo.findOneByOrFail({ id: root.authorId });
  }
  @ResolveField(() => GameObject)
  async game(@Root() root: Partial<ScrimObject>) {
    if (root.game) return root.game;
    return this.gameRepo.findOneByOrFail({ id: root.gameId });
  }
  @ResolveField(() => SkillGroupObject)
  async skillGroup(@Root() root: ScrimObject) {
    if (root.skillGroup) return root.skillGroup;
    return this.skillGroupRepo.findOneByOrFail({ id: root.skillGroupId });
  }
  @ResolveField(() => GameModeObject)
  async gameMode(@Root() root: ScrimObject) {
    if (root.gameMode) return root.gameMode;
    return this.gameModeRepo.findOneByOrFail({ id: root.gameModeId });
  }
  @ResolveField(() => GameModeObject)
  async createdAt(@Root() root: ScrimObject) {
    return new Date(root.createdAt);
  }

  @ResolveField(() => [String], { nullable: true })
  @UseGuards(AuthorizeGuard())
  participants(
    @Root() root: ScrimObject,
    @Args('admin', { nullable: true, defaultValue: false }) admin: boolean,
    @CurrentUser() user: User,
  ) {
    if (admin) {
      // TODO: authz
      return root.participants;
    } else if (root.state === ScrimState.PENDING) {
      return null;
    } else if (root.participants.some((p) => p.id === user.id)) {
      return root.participants;
    }
    return null;
  }

  @ResolveField(() => Int)
  async pendingTtl(@Root() root: ScrimObject) {
    if (typeof root.pendingTtl === 'number') return root.pendingTtl;

    return await this.internalScrimService.getPendingTTL({
      scrimId: root.id,
    });
  }
}
