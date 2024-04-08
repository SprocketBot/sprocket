import { OnQueueEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { safeParse } from 'valibot';
import {
  ScrimPendingTimeoutPayloadSchema,
  ScrimPendingTimeoutQueue,
} from './schema';
import { Logger } from '@nestjs/common';
import { ScrimService } from '../../scrim/scrim.service';

@Processor(ScrimPendingTimeoutQueue)
export class ScrimPendingTimeoutProcessor extends WorkerHost {
  private readonly logger = new Logger(ScrimPendingTimeoutProcessor.name);
  constructor(private readonly scrimService: ScrimService) {
    super();
  }

  async process(job: Job<unknown>, token?: string) {
    const payload = safeParse(ScrimPendingTimeoutPayloadSchema, job.data);
    if (!payload.success) {
      this.logger.error('Failed to parse scrim pending payload', {
        issues: payload.issues,
      });
      await job.moveToFailed(
        new Error('Failed to parse scrim pending payload'),
        token,
      );
      return;
    } else {
      await this.scrimService.destroyScrim(payload.output.scrimId, true);
    }
  }
}
