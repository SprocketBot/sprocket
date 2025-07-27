import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ScrimTimeout } from '../../entities/scrim-timeout.entity';
import { ScrimService } from '../../scrim/scrim.service';

@Injectable()
export class ScrimPendingTimeoutService implements OnModuleInit {
  private readonly logger = new Logger(ScrimPendingTimeoutService.name);
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(ScrimTimeout)
    private readonly scrimTimeoutRepo: Repository<ScrimTimeout>,
    private readonly scrimService: ScrimService,
  ) {}

  onModuleInit() {
    // Run every minute
    this.intervalId = setInterval(() => this.processExpiredScrims(), 60_000);
  }

  async enqueue(scrimId: string, timeout: number = 5 * 60 * 1000) {
    const expiresAt = new Date(Date.now() + timeout);
    await this.scrimTimeoutRepo.save({ scrim_id: scrimId, expires_at: expiresAt });
    this.logger.verbose(`Scheduled scrim timeout for ${scrimId} at ${expiresAt}`);
  }

  async cancel(scrimId: string) {
    await this.scrimTimeoutRepo.delete({ scrim_id: scrimId });
    this.logger.verbose(`Cancelled scrim timeout for ${scrimId}`);
  }

  async getTtl(scrimId: string): Promise<number> {
    const timeout = await this.scrimTimeoutRepo.findOne({ where: { scrim_id: scrimId } });
    if (!timeout) return 0;
    return timeout.expires_at.getTime() - Date.now();
  }

  private async processExpiredScrims() {
    const now = new Date();
    const expired = await this.scrimTimeoutRepo.find({ where: { expires_at: LessThan(now) } });
    for (const timeout of expired) {
      try {
        await this.scrimService.destroyScrim(timeout.scrim_id, true);
        await this.scrimTimeoutRepo.delete({ scrim_id: timeout.scrim_id });
        this.logger.verbose(`Processed expired scrim timeout for ${timeout.scrim_id}`);
      } catch (e) {
        this.logger.error(`Failed to process scrim timeout for ${timeout.scrim_id}: ${e}`);
      }
    }
  }
}
