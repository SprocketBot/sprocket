import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckError,
} from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(
    private readonly health: HealthCheckService,

    @InjectDataSource()
    private readonly db: DataSource,
  ) { }

  @Get('/health')
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        try {
          await this.db.query('SELECT 1');
          return { db: { status: 'up' } };
        } catch (e) {
          this.logger.error(e);
          throw new HealthCheckError(e.message, {
            db: 'Unable to query database',
          });
        }
      },
    ]);
  }
}
