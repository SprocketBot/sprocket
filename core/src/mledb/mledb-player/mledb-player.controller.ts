import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreEndpoint, CoreSchemas } from '@sprocketbot/common';
import { Repository } from 'typeorm';

import { MLE_Player, MLE_Team } from '../../database/mledb';

@Controller('mledb-player')
export class MledbPlayerController {
  constructor(
    @InjectRepository(MLE_Player)
    private readonly playerRepository: Repository<MLE_Player>,
    @InjectRepository(MLE_Team)
    private readonly teamRepository: Repository<MLE_Team>,
  ) {}

  @MessagePattern(CoreEndpoint.GetNicknameByDiscordUser)
  async getNicknameByDiscordUser(@Payload() payload: unknown): Promise<string> {
    const data = CoreSchemas.GetNicknameByDiscordUser.input.parse(payload);
    const player = await this.playerRepository.findOneOrFail({
      where: { discordId: data.discordId },
    });

    if (player.teamName === 'FP') {
      return player.name;
    }

    const team = await this.teamRepository.findOneOrFail({
      where: { name: player.teamName },
    });

    return `${team.callsign} | ${player.name}`;
  }
}
