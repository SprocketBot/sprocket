import { Module } from '@nestjs/common';
import { BotModule, CoreModule, EventsModule } from '@sprocketbot/common';

import { MemberService } from './member.service';

@Module({
  imports: [EventsModule, BotModule, CoreModule],
  providers: [MemberService],
})
export class MemberModule {}
