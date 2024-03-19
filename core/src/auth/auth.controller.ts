import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Request,
  Response,
} from '@nestjs/common';
import type { Request as Req, Response as Res } from 'express';
import { AuthenticateService } from './authenticate/authenticate.service';
import { User } from '@sprocketbot/lib/types/auth';
import { AuthorizeService } from './authorize/authorize.service';
@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authenticateService: AuthenticateService) {}

  @Get('auth/check')
  async checkAuth(
    @Request() req: Req,
    @Response({ passthrough: true }) res: Res,
  ): Promise<User | false> {
    const user = this.authenticateService.getUserFromRequest(req);
    if (user) {
      return user;
    } else {
      this.authenticateService.logout(res);
      this.logger.debug('User Not Logged in!');
      return false;
    }
  }
  @Get('auth/logout')
  async logout(@Request() req: Req, @Response({ passthrough: true }) res: Res) {
    if (!this.authenticateService.getUserFromRequest(req)) {
      throw new HttpException('', HttpStatus.UNAUTHORIZED);
    }
    this.authenticateService.logout(res);

    return true;
  }
}
