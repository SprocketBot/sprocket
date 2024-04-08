import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, type SlashCommandContext } from 'necord';

@Injectable()
export class InfoController {
  @SlashCommand({
    name: 'ping',
    description: 'Test command to check if the bot is reachable',
    guilds: ['984300673787113512'],
  })
  async ping(@Context() [interaction]: SlashCommandContext) {
    await interaction.reply('pong!');
  }
}
