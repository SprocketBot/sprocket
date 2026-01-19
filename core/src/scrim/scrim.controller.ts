import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { CoreOutput } from '@sprocketbot/common';
import { CoreEndpoint, CoreSchemas } from '@sprocketbot/common';

import { ScrimService } from './scrim.service';

@Controller('scrim')
export class ScrimController {
  constructor(private readonly scrimService: ScrimService) {}

  @MessagePattern(CoreEndpoint.GetScrimReportCardWebhooks)
  async getScrimReportCardWebhooks(
    @Payload() payload: unknown,
  ): Promise<CoreOutput<CoreEndpoint.GetScrimReportCardWebhooks>> {
    const data = CoreSchemas.GetScrimReportCardWebhooks.input.parse(payload);
    return this.scrimService.getRelevantWebhooks(data);
  }

  @MessagePattern(CoreEndpoint.GetUsersLatestScrim)
  async getUsersLatestScrim(
    @Payload() payload: unknown,
  ): Promise<CoreOutput<CoreEndpoint.GetUsersLatestScrim>> {
    const data = CoreSchemas.GetUsersLatestScrim.input.parse(payload);
    const scrimId = await this.scrimService.getLatestScrimIdByUserId(
      data.userId,
      data.organizationId,
    );
    return { id: scrimId };
  }
}
