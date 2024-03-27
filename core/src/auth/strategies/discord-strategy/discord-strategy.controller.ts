import { Request, Response, Controller, Get, UseGuards } from '@nestjs/common';
import type { Request as Req, Response as Res } from 'express';
import { DiscordStrategyGuard } from './discord-strategy.guard';
import { SprocketConfigService } from '@sprocketbot/lib';
import { AuthenticateService } from '../../authenticate/authenticate.service';

@Controller()
export class DiscordStrategyController {
  constructor(
    private readonly config: SprocketConfigService,
    private readonly authenticateService: AuthenticateService,
  ) {}

  @Get('oauth/callback/discord')
  @UseGuards(DiscordStrategyGuard)
  async discordLogin(@Request() req: Req, @Response() res: Res): Promise<void> {
    const redirUrl = `${this.config.getOrThrow('protocol')}://${this.config.getOrThrow('frontend.callback')}`;

    await this.authenticateService.login(res, req.user);
    res.redirect(redirUrl);
    res.send();
    return;
  }
}
