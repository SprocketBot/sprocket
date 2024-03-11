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
    const discordProfile = safeParse(DiscordProfileSchema, req.user);

    const redirUrl = `${this.config.getOrThrow('protocol')}://${this.config.getOrThrow('frontend.callback')}`;

    if (discordProfile.success === false) {
      const uuid = v4();
      this.logger.error(`${uuid} ${discordProfile.issues}`);

      res.redirect(
        `${redirUrl}?status=error&message=${`An unknown exception has occurred. (${uuid})`}`,
      );
      return;
    }

    // TODO: Actually Authenticate Users

    await this.authenticateService.login(res, {
      username: discordProfile.output.username,
    });
    res.redirect(redirUrl);
    res.send();

    return;
  }
}
