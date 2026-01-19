import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { CoreOutput } from '@sprocketbot/common';
import { CoreEndpoint, CoreSchemas } from '@sprocketbot/common';

import type { GameSkillGroupProfile } from '$db/franchise/game_skill_group_profile/game_skill_group_profile.model';

import { GameSkillGroupService } from './game-skill-group.service';

@Controller('game-skill-group')
export class GameSkillGroupController {
  constructor(private readonly gameSkillGroupService: GameSkillGroupService) {}

  @MessagePattern(CoreEndpoint.GetGameSkillGroupProfile)
  async getGameSkillGroupProfile(@Payload() payload: unknown): Promise<GameSkillGroupProfile> {
    const data = CoreSchemas.GetGameSkillGroupProfile.input.parse(payload);
    return this.gameSkillGroupService.getGameSkillGroupProfile(data.skillGroupId);
  }

  @MessagePattern(CoreEndpoint.GetSkillGroupWebhooks)
  async getSkillGroupWebhooks(
    @Payload() payload: unknown,
  ): Promise<CoreOutput<CoreEndpoint.GetSkillGroupWebhooks>> {
    const data = CoreSchemas.GetSkillGroupWebhooks.input.parse(payload);
    return this.gameSkillGroupService.getSkillGroupWebhooks(data.skillGroupId);
  }
}
