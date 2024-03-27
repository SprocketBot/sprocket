import { Request, Response, Controller, Get, UseGuards } from '@nestjs/common';
import type { Request as Req, Response as Res } from 'express';
import { SteamStrategyGuard } from './steam-strategy.guard';
import { SprocketConfigService } from '@sprocketbot/lib';
import { AuthenticateService } from '../../authenticate/authenticate.service';
import type { SteamProfile } from './types';
import { AuthPlatform } from '@sprocketbot/lib/types';

@Controller()
export class SteamStrategyController {
  constructor(
    private readonly config: SprocketConfigService,
    private readonly authenticateService: AuthenticateService,
  ) {}

  @Get('oauth/callback/steam')
  @UseGuards(SteamStrategyGuard)
  async steamLogin(@Request() req: Req, @Response() res: Res): Promise<void> {
    const sessionUser = this.authenticateService.getUserFromRequest(req);
    // We have a special case here
    const steamUser = req.user as unknown as SteamProfile;
    if (sessionUser) {
      console.log('Attempting to link');
      // We are linking an account
      await this.authenticateService.linkAccount(sessionUser.id, {
        platform: AuthPlatform.STEAM,
        platformId: steamUser.id,
        platformName: steamUser.displayName,
        avatarUrl: steamUser._json.avatarfull,
      });
      // Done!
    } else {
      // This is a sign in
      const signedIn = await this.authenticateService.loginByUserAccount(res, {
        platform: AuthPlatform.STEAM,
        platformId: steamUser.id,
      });
      if (!signedIn) {
        const loginUrl = `${this.config.getOrThrow('protocol')}://${this.config.getOrThrow('frontend.callback')}?status=error&message=User%20not%20found`;
        res.redirect(loginUrl);
        res.send();
        return;
      }
    }
    const redirUrl = `${this.config.getOrThrow('protocol')}://${this.config.getOrThrow('frontend.callback')}`;
    res.redirect(redirUrl);
    res.send();
    return;
  }
}
