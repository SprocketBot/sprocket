import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, type SlashCommandContext } from 'necord';

@Injectable()
export class InfoController {
  @SlashCommand({
    name: 'ping',
    description: 'Test command to check if the bot is reachable',
    guilds: ['856323300015865896'],
  })
  async ping(@Context() [interaction]: SlashCommandContext) {
    await interaction.reply('pong!');
  }
}
