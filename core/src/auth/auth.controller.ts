import { Controller, Get, Request, Response } from '@nestjs/common';
import type { Request as Req, Response as Res } from 'express';
import { AuthenticateService } from './authenticate/authenticate.service';
@Controller()
export class AuthController {
  constructor(private readonly authenticateService: AuthenticateService) {}
  @Get('auth/check')
  async checkAuth(@Request() req: Req) {
    if (this.authenticateService.requestHasValidToken(req)) {
      return true;
    } else {
      return false;
    }
  }
  @Get('auth/logout')
  async logout(@Response({ passthrough: true }) res: Res) {
    this.authenticateService.logout(res);
    return 'done';
  }
}
