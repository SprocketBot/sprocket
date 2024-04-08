import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ScrimPoppedTimeoutPayload, ScrimPoppedTimeoutQueue } from './schema';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ScrimPoppedTimeoutService {
  private readonly logger = new Logger(ScrimPoppedTimeoutService.name);
  constructor(
    @InjectQueue(ScrimPoppedTimeoutQueue)
    private readonly queue: Queue<ScrimPoppedTimeoutPayload>,
  ) {}

  async getTtl(scrimId: string) {
    const job = await this.queue.getJob(scrimId);
    const { delay, timestamp } = job;
    const targetProcessingTime = timestamp + delay;
    const now = Date.now();
    return targetProcessingTime - now;
  }

  async register(
    scrimId: string,
    timeout: number = 5 * 60 * 1000 /* 5 minutes */,
  ) {
    await this.queue.add(scrimId, { scrimId }, { delay: timeout });
  }
}
