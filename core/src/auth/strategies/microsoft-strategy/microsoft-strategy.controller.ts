import {
  Request,
  Response,
  Controller,
  Get,
  UseGuards,
  Logger,
} from '@nestjs/common';
import type { Request as Req, Response as Res } from 'express';
import { MicrosoftStrategyGuard } from './microsoft-strategy.guard';
import { SprocketConfigService } from '@sprocketbot/lib';
import { AuthenticateService } from '../../authenticate/authenticate.service';
import { AuthPlatform } from '@sprocketbot/lib/types';

@Controller()
export class MicrosoftStrategyController {
  private readonly logger = new Logger(MicrosoftStrategyController.name);
  constructor(
    private readonly config: SprocketConfigService,
    private readonly authenticateService: AuthenticateService,
  ) {}

  @Get('oauth/callback/microsoft')
  @UseGuards(MicrosoftStrategyGuard)
  async microsoftLogin(
    @Request() req: Req,
    @Response() res: Res,
  ): Promise<void> {
    const sessionUser = await this.authenticateService.getUserFromRequest(req);

    // We have a special case here
    const microsoftUser = req.user as any;
    if (sessionUser) {
      this.logger.log('Attempting to link');
      // We are linking an account
      await this.authenticateService.linkAccount(sessionUser.id, {
        platform: AuthPlatform.STEAM,
        platformId: microsoftUser.id,
        platformName: microsoftUser.displayName,
        avatarUrl: microsoftUser._json.avatarfull,
      });
      // Done!
    } else {
      // This is a sign in
      const signedIn = await this.authenticateService.loginByUserAccount(res, {
        platform: AuthPlatform.STEAM,
        platformId: microsoftUser.id,
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
