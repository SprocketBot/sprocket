import { Controller, Get, Logger, Request, Response } from '@nestjs/common';
import type { Request as Req, Response as Res } from 'express';
import { AuthenticateService } from './authenticate/authenticate.service';
import { User } from '@sprocketbot/lib/types/auth';
import { SprocketConfigService } from '@sprocketbot/lib';
import { AuthZService } from 'nest-authz';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authenticateService: AuthenticateService,
    private readonly authZService: AuthZService,
    private readonly config: SprocketConfigService,
  ) {}

  @Get('auth/check')
  async checkAuth(
    @Request() req: Req,
    @Response({ passthrough: true }) res: Res,
  ): Promise<User | false> {
    const user = this.authenticateService.getUserFromRequest(req);
    if (user) {
      const updatedUser = await this.authenticateService.refreshUser(req, res);
      if (updatedUser === null) {
        this.logger.error(`User unexpectedly null, clearing session`, { user });
        this.authenticateService.logout(res);
        return false;
      }
      return updatedUser;
    } else {
      this.authenticateService.logout(res);
      this.logger.debug('User Not Logged in!');
      return false;
    }
  }
  @Get('auth/logout')
  async logout(@Request() req: Req, @Response({ passthrough: true }) res: Res) {
    this.authenticateService.logout(res);
    const redirUrl = `${this.config.getOrThrow('protocol')}://${this.config.getOrThrow('frontend.url')}/login`;
    res.redirect(redirUrl);
    res.send();
    return;
  }
}
