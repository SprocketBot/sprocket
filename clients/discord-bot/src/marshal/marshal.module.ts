import { forwardRef, Module } from '@nestjs/common';
import { CoreModule } from '@sprocketbot/common';

import { DiscordModule } from '../discord/discord.module';
import { EmbedModule } from '../embed/embed.module';
import { EmbedService } from '../embed/embed.service';
import { CommandsModule } from './commands/commands.module';

@Module({
  imports: [forwardRef(() => DiscordModule), EmbedModule, CoreModule, CommandsModule],
  providers: [EmbedService],
  exports: [EmbedService],
})
export class MarshalModule {}
