import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { safeParse } from 'valibot';
import {
  ScrimPoppedTimeoutPayloadSchema,
  ScrimPoppedTimeoutQueue,
} from './schema';
import { Logger } from '@nestjs/common';
import { ScrimService } from '../../scrim/scrim.service';

@Processor(ScrimPoppedTimeoutQueue)
export class ScrimPoppedTimeoutProcessor extends WorkerHost {
  private readonly logger = new Logger(ScrimPoppedTimeoutProcessor.name);
  constructor(private readonly scrimService: ScrimService) {
    super();
  }

  async process(job: Job<unknown>, token?: string) {
    const payload = safeParse(ScrimPoppedTimeoutPayloadSchema, job.data);
    if (!payload.success) {
      this.logger.error('Failed to parse scrim popped payload', {
        issues: payload.issues,
      });
      await job.moveToFailed(
        new Error('Failed to parse scrim popped payload'),
        token,
      );
    } else {
      await this.scrimService.destroyScrim(payload.output.scrimId);
      await job.moveToCompleted(null, token);
    }
  }
}
