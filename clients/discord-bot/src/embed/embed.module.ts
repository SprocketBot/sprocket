import { Module } from '@nestjs/common';
import { CoreModule } from '@sprocketbot/common';

import { EmbedService } from './embed.service';

@Module({
  imports: [CoreModule],
  providers: [EmbedService],
  exports: [EmbedService],
})
export class EmbedModule {}
