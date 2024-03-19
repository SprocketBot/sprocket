import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NecordModule } from 'necord';
import { BaseSprocketModules, SprocketConfigService } from '@sprocketbot/lib';
import { Client, IntentsBitField } from 'discord.js';
import { InfoController } from './info/info.controller';

@Module({
  imports: [
    ...BaseSprocketModules,
    NecordModule.forRootAsync({
      inject: [SprocketConfigService],
      useFactory(cfg: SprocketConfigService) {
        return {
          token: cfg.getOrThrow('auth.discord.botToken'),
          intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMessageReactions,
            IntentsBitField.Flags.GuildMembers,
          ],
          failIfNotExists: true,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, InfoController],
})
export class AppModule {
  constructor(private readonly client: Client) {}

  async onApplicationBootstrap() {
    this.client.user.setActivity({
      name: '🎓 Learning how to run ESports Leagues',
      url: 'https://github.com/sprocketbot/sprocket',
    });
  }
}
