import { ResolveField, Resolver, Root, Query } from '@nestjs/graphql';
import { SkillGroupObject } from '../skill_group/skill_group.object';
import { GameObject } from './game.object';
import { GameRepository } from '../../db/game/game.repository';
import { UseGuards } from '@nestjs/common';
import { AuthorizeGuard } from '../../auth/authorize/authorize.guard';

@Resolver(() => GameObject)
export class GameResolver {
  constructor(private readonly gameRepo: GameRepository) {}

  @Query(() => [GameObject])
  @UseGuards(AuthorizeGuard())
  async games() {
    return this.gameRepo.find();
  }

  @ResolveField(() => [SkillGroupObject])
  async skillGroups(@Root() root: Partial<GameObject>) {
    if (root.skillGroups) return root.skillGroups;
    const game = await this.gameRepo.findOneByOrFail({ id: root.id });
    return await game.skillGroups;
  }
  @ResolveField(() => [SkillGroupObject])
  async gameModes(@Root() root: Partial<GameObject>) {
    if (root.gameModes) return root.gameModes;
    const game = await this.gameRepo.findOneByOrFail({ id: root.id });
    return await game.gameModes;
  }
}
