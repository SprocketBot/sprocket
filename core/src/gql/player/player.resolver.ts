import { Args, Mutation, ResolveField, Resolver, Root } from '@nestjs/graphql';
import {
  UpdatePlayerInput,
  CreatePlayerInput,
  PlayerObject,
} from './player.object';
import { UserObject } from '../user/user.object';
import { PlayerRepository } from '../../db/player/player.repository';
import { GameObject } from '../game/game.object';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { UseGuards } from '@nestjs/common';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';

@Resolver(() => PlayerObject)
export class PlayerResolver {
  constructor(private readonly playerRepo: PlayerRepository) {}

  @Mutation(() => PlayerObject)
  @UseGuards(AuthorizeGuard()) // todo: authz
  async createPlayer(@Args('data') data: CreatePlayerInput) {
    const player = await this.playerRepo.save(data);
    // TODO: Elo Side Effects
    return player;
  }

  @Mutation(() => PlayerObject)
  @UseGuards(AuthorizeGuard()) // todo: authz
  async updatePlayer(@Args('data') data: UpdatePlayerInput) {
    const player = await this.playerRepo.findOneByOrFail({
      id: data.playerId,
    });

    if (data.destinationSkillGroupId) {
      // TODO: Elo Side Effects
      player.skillGroupId = data.destinationSkillGroupId;
    }
    await this.playerRepo.save(player);

    return player;
  }

  @Mutation(() => PlayerObject)
  @UseGuards(AuthorizeGuard()) // todo: authz
  async deletePlayer(@Args('playerId') playerId: string) {
    const player = await this.playerRepo.findOneByOrFail({
      id: playerId,
    });
    await this.playerRepo.delete({
      id: playerId,
    });

    return player;
  }

  @ResolveField(() => UserObject)
  async user(@Root() root: Partial<PlayerObject>) {
    if (root.user) return root.user;
    const player = await this.playerRepo.findOneByOrFail({ id: root.id });
    return await player.user;
  }

  @ResolveField(() => GameObject)
  async game(@Root() root: Partial<PlayerObject>) {
    if (root.game) return root.game;
    const player = await this.playerRepo.findOneByOrFail({ id: root.id });
    return await player.game;
  }

  @ResolveField(() => SkillGroupObject)
  async skillGroup(@Root() root: Partial<PlayerObject>) {
    if (root.skillGroup) return root.skillGroup;
    const player = await this.playerRepo.findOneByOrFail({ id: root.id });
    return await player.skillGroup;
  }
}
