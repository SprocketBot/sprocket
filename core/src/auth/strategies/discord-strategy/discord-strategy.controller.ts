import {
  Request,
  Response,
  Controller,
  Get,
  UseGuards,
  Logger,
} from '@nestjs/common';
import type { Request as Req, Response as Res } from 'express';
import { v4 } from 'uuid';
import { DiscordStrategyGuard } from './discord-strategy.guard';
import { DiscordProfileSchema } from './discord-strategy.schemas';
import { JwtService } from '@nestjs/jwt';
import { SprocketConfigService } from '@sprocketbot/lib';
import { AuthenticateService } from '../../authenticate/authenticate.service';
import { safeParse } from 'valibot';

@Controller()
export class DiscordStrategyController {
  private readonly logger = new Logger(DiscordStrategyController.name);
  constructor(
    private readonly config: SprocketConfigService,
    private readonly jwtService: JwtService,
    private readonly authenticateService: AuthenticateService,
  ) {}

  @Get('oauth/callback/discord')
  @UseGuards(DiscordStrategyGuard)
  async discordLogin(@Request() req: Req, @Response() res: Res): Promise<void> {
    const redirUrl = `${this.config.getOrThrow('protocol')}://${this.config.getOrThrow('frontend.callback')}`;
    // TODO: Actually Authenticate Users

    console.log(req.user);

    await this.authenticateService.login(res, req.user);
    res.redirect(redirUrl);
    res.send();

    return;
  }
}
