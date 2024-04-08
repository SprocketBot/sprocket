import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ScrimPendingTimeoutPayload, ScrimPendingTimeoutQueue } from './schema';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ScrimPendingTimeoutService {
  private readonly logger = new Logger(ScrimPendingTimeoutService.name);
  constructor(
    @InjectQueue(ScrimPendingTimeoutQueue)
    private readonly queue: Queue<ScrimPendingTimeoutPayload>,
  ) {}

  async getTtl(scrimId: string) {
    const job = await this.queue.getJob(scrimId);
    if (!job) return 0;
    const { delay, timestamp } = job;
    const targetProcessingTime = timestamp + delay;
    const now = Date.now();
    return targetProcessingTime - now;
  }

  async enqueue(
    scrimId: string,
    timeout: number = 5 * 60 * 1000 /* 5 minutes */,
  ) {
    await this.logger.verbose(`Queued Pending Timeout job for ${scrimId}`);
    await this.queue.add(
      scrimId,
      { scrimId },
      { delay: timeout, jobId: scrimId },
    );
  }

  async cancel(scrimId: string) {
    const job = await this.queue.getJob(scrimId);
    if (!job) return;
    await job.remove();
  }
}
