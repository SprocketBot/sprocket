import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { CoreOutput } from '@sprocketbot/common';
import { CoreEndpoint, CoreSchemas } from '@sprocketbot/common';

import { MledbMatchService } from './mledb-match.service';

@Controller('mledb-match')
export class MledbMatchController {
  constructor(private readonly matchService: MledbMatchService) {}

  @MessagePattern(CoreEndpoint.GetMleMatchInfoAndStakeholders)
  async getMleMatchInfoAndStakeholders(
    @Payload() payload: unknown,
  ): Promise<CoreOutput<CoreEndpoint.GetMleMatchInfoAndStakeholders>> {
    const data = CoreSchemas.GetMleMatchInfoAndStakeholders.input.parse(payload);
    return this.matchService.getMleMatchInfoAndStakeholders(data.sprocketMatchId);
  }
}
