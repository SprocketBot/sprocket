import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SprocketConfigService } from '@sprocketbot/lib';
import type { Request, Response } from 'express';

@Injectable()
export class AuthenticateService {
  private readonly logger = new Logger(AuthenticateService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: SprocketConfigService,
  ) {
    this.COOKIE_DOMAIN = `${this.config.getOrThrow('BASE_URL')}`;
  }

  requestHasValidToken(req: Request): Express.User | false {
    const authCookie = req.cookies[this.AUTH_COOKIE_NAME];

    const tokenQuery = req.query['token']?.toString();
    console.log({ authCookie, tokenQuery });
    if (!authCookie && !tokenQuery) {
      return false;
    }
    const auth = tokenQuery ? decodeURI(tokenQuery) : decodeURI(authCookie);

    try {
      return this.jwtService.verify<Express.User>(auth);
    } catch (e) {
      this.logger.debug(e);
      return false;
    }
  }

  private readonly AUTH_COOKIE_NAME = 'sprocket-token';
  private readonly REFRESH_COOKIE_NAME = 'sprocket-refresh';
  private readonly COOKIE_DOMAIN: string;

  logout(res: Response): void {
    res.clearCookie(this.AUTH_COOKIE_NAME, {
      domain: this.COOKIE_DOMAIN,
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  login(res: Response, user: Express.User): void {
    const token = this.jwtService.sign(user);
    res.cookie(this.AUTH_COOKIE_NAME, token, {
      domain: this.COOKIE_DOMAIN,
      httpOnly: true,
      sameSite: 'lax',
    });
  }
}
