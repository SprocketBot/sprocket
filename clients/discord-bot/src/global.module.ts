import { Global, Module } from '@nestjs/common';
import { AnalyticsModule } from '@sprocketbot/common';

@Global()
@Module({
  imports: [AnalyticsModule],
  exports: [AnalyticsModule],
})
export class GlobalModule {}
