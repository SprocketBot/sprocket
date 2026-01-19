import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { JobId } from 'bull';
import { Queue } from 'bull';

import type { EloEndpoint, EloInput, EloOutput, JobListenerPayload } from './elo-connector.types';
import { EloBullQueue } from './elo-connector.types';

@Injectable()
export class EloConnectorService {
  private readonly logger = new Logger(EloConnectorService.name);

  private listeners = new Map<JobId, JobListenerPayload>();

  constructor(@InjectQueue(EloBullQueue) private eloQueue: Queue) {}

  async createJob<E extends EloEndpoint>(endpoint: E, data: EloInput<E>): Promise<JobId> {
    const job = await this.eloQueue.add(endpoint, data, { removeOnComplete: true });
    return job.id;
  }

  async createJobAndWait<E extends EloEndpoint>(
    endpoint: E,
    data: EloInput<E>,
  ): Promise<EloOutput<E>> {
    return new Promise((resolve, reject) => {
      this.eloQueue
        .add(endpoint, data, { removeOnComplete: true })
        .then(job => {
          this.listeners.set(job.id, {
            endpoint: endpoint,
            success: async (d: EloOutput<E>): Promise<void> => {
              resolve(d);
            },
            failure: async (e: Error): Promise<void> => {
              reject(e);
            },
          });
        })
        .catch(reject);
    });
  }

  getJobListener(jobId: JobId): JobListenerPayload | undefined {
    return this.listeners.get(jobId);
  }
}
