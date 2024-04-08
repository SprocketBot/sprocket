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
  MatchmakingService,
  type Scrim,
} from '@sprocketbot/matchmaking';
import { CurrentUser } from 'src/auth/current-user/current-user.decorator';
import { Inject, UseGuards } from '@nestjs/common';
import { AuthorizeGuard } from 'src/auth/authorize/authorize.guard';
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
import { ScrimState } from '@sprocketbot/matchmaking';
import { GameModeObject } from '../game_mode/game_mode.object';
import { GameModeRepository } from '../../db/game_mode/game_mode.repository';
import { ScrimService } from './scrim.service';

@Resolver(() => ScrimParticipantObject)
export class ScrimParticipantResolver {
  constructor(private readonly userRepo: UserRepository) {}

  @ResolveField(() => String)
  async name(@Root() root: ScrimParticipantObject) {
    if (root.name) return root.name;
    const user = await this.userRepo.findOneBy({ id: root.id });
    if (!user) throw new Error(`User not found!`);
    return user.username;
  }
}

@Resolver(() => ScrimObject)
export class ScrimResolver {
  constructor(
    private readonly scrimService: ScrimService,
    private readonly matchmakingService: MatchmakingService,
    private readonly userRepo: UserRepository,
    private readonly playerRepo: PlayerRepository,
    private readonly gameRepo: GameRepository,
    private readonly gameModeRepo: GameModeRepository,
    private readonly skillGroupRepo: SkillGroupRepository,
    @Inject(PubSubProvider)
    private readonly pubsub: PubSubEngine,
  ) {}

  @Subscription(() => ScrimObject, {
    name: 'currentScrim',
    nullable: true,
    filter: ScrimService.filterCurrentScrim,
    resolve: ScrimService.resolveScrim(true),
  })
  @UseGuards(AuthorizeGuard())
  async currentScrimLive() {
    return this.pubsub.asyncIterator(MatchmakingEvents.ScrimUpdated);
  }

  @Subscription(() => ScrimObject, {
    name: 'pendingScrims',
    resolve: ScrimService.resolveScrim(false),
    filter: ScrimService.filterPendingScrims,
  })
  @UseGuards(AuthorizeGuard())
  async availableScrimsLive() {
    return this.pubsub.asyncIterator(MatchmakingEvents.ScrimUpdated);
  }
  @Subscription(() => ScrimObject, {
    name: 'allScrims',
    resolve: ScrimService.resolveScrim(false),
  })
  @UseGuards(AuthorizeGuard())
  async allScrimsLive() {
    return this.pubsub.asyncIterator(MatchmakingEvents.ScrimUpdated);
  }

  @Query(() => [ScrimObject])
  @UseGuards(AuthorizeGuard())
  async pendingScrims(
    @CurrentUser() user: User,
    @Args('admin', { nullable: true, defaultValue: false }) admin: boolean,
    @Args('query', { nullable: true }) query?: ListScrimsInput,
  ) {
    return this.scrimService.getPendingScrims(query ?? {}, user, admin);
  }

  @Query(() => [ScrimObject])
  @UseGuards(AuthorizeGuard())
  async allScrims(@Args('query', { nullable: true }) query?: ListScrimsInput) {
    return await this.scrimService.listScrims(query ?? {});
  }

  @Query(() => ScrimObject, { nullable: true })
  @UseGuards(AuthorizeGuard())
  async currentScrim(@CurrentUser() authUser: User) {
    return await this.scrimService.getScrimForUser(authUser);
  }

  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard())
  async createScrim(
    @CurrentUser() user: User,
    @Args('payload', { type: () => CreateScrimInput })
    payload: CreateScrimInput,
  ): Promise<Scrim> {
    return await this.scrimService.createScrim(user, payload);
  }
  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard())
  async destroyScrim(
    @CurrentUser() user: User,
    @Args('payload', { type: () => DestroyScrimInput })
    payload: DestroyScrimInput,
  ): Promise<Scrim> {
    return await this.scrimService.destroyScrim(user, {
      ...payload,
      cancel: true,
    });
  }

  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard())
  async joinScrim(
    @CurrentUser() user: User,
    @Args('scrimId', { type: () => String }) scrimId: string,
  ): Promise<Scrim> {
    return await this.matchmakingService.joinScrim(user, scrimId);
  }

  @Mutation(() => ScrimObject)
  @UseGuards(AuthorizeGuard())
  async leaveScrim(@CurrentUser() user: User): Promise<Scrim> {
    return await this.matchmakingService.removeUserFromScrim(user);
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

    return await this.matchmakingService.getScrimPendingTtl(root.id);
  }
}
