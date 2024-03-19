import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SprocketConfigService } from '@sprocketbot/lib';
import { UserSchema, type User } from '@sprocketbot/lib/types';
import type { Request, Response } from 'express';
import { AuthorizeService } from '../authorize/authorize.service';
import { parse } from 'valibot';

@Injectable()
export class AuthenticateService {
  private readonly logger = new Logger(AuthenticateService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: SprocketConfigService,
    private readonly authorizeService: AuthorizeService,
  ) {
    this.COOKIE_DOMAIN = `${this.config.getOrThrow('BASE_URL')}`;
  }

  getUserFromRequest(req: Request): User | false {
    const authCookie = req.cookies[this.AUTH_COOKIE_NAME];

    const tokenQuery = req.query['token']?.toString();

    if (!authCookie && !tokenQuery) {
      return false;
    }
    const auth = tokenQuery ? decodeURI(tokenQuery) : decodeURI(authCookie);

    try {
      const content = this.jwtService.verify<User>(auth);
      return parse(UserSchema, content);
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
      secure: this.config.getOrThrow('secure'),
    });
  }

  async login(res: Response, user: User): Promise<void> {
    user.allowedActions = (
      await this.authorizeService.getPermissions(user)
    ).filter((spec) => spec.target.startsWith('View__'));
    const token = this.jwtService.sign(parse(UserSchema, user));

    res.cookie(this.AUTH_COOKIE_NAME, token, {
      domain: this.COOKIE_DOMAIN,
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.getOrThrow('secure'),
    });
  }
}
