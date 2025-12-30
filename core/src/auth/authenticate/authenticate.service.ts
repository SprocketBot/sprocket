import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SprocketConfigService } from '@sprocketbot/lib';
import { UserSchema, type User } from '@sprocketbot/lib/types';
import type { Request as ExpressRequest, Response } from 'express';
import { parse } from 'valibot';
import { UserRepository } from '../../db/user/user.repository';
import { UserAuthAccountRepository } from '../../db/user_auth_account/user_auth_account.repository';
import { UserAuthAccountEntity } from '../../db/user_auth_account/user_auth_account.entity';
import type { DeepPartial } from 'typeorm';
import { default as cookieParser } from 'cookie-parser';
import * as cookieParserAlt from 'cookie-parser';

import { ApiTokenService } from '../api_token/api_token.service';

@Injectable()
export class AuthenticateService {
  private readonly logger = new Logger(AuthenticateService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: SprocketConfigService,
    private readonly userAuthAcctRepo: UserAuthAccountRepository,
    private readonly userRepo: UserRepository,
    private readonly apiTokenService: ApiTokenService,
  ) {
    const baseUrl = config.getOrThrow<string>('BASE_URL');
    const url = new URL(
      baseUrl.includes('://') ? baseUrl : `http://${baseUrl}`,
    );
    this.COOKIE_DOMAIN = url.hostname;
  }

  private readonly cookieMiddleware =
    typeof cookieParser === 'function' ? cookieParser() : cookieParserAlt();
  private readonly addCookiesToRequest = (req: Request) => {
    this.cookieMiddleware(req as any, null, () => {});
  };

  async getUserFromRequest(
    req: ExpressRequest | Request,
  ): Promise<User | false> {
    // Check for API Token
    const authHeader = req.headers['authorization'];
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      const token = authHeader.split(' ')[1];
      // Try as API Token first (sk_)
      if (token.startsWith('sk_')) {
        const apiToken = await this.apiTokenService.validateToken(token);
        if (apiToken && apiToken.user) {
          (req as any).apiToken = apiToken;
          const userObj = {
            ...apiToken.user,
            avatarUrl: apiToken.user.avatarUrl ?? undefined,
          };
          return parse(UserSchema, userObj);
        }
      } else {
        // Try as JWT
        try {
          const content = this.jwtService.verify<User>(token);
          return parse(UserSchema, content);
        } catch (e) {
          // Ignore error, fall back to cookies
        }
      }
    }

    // When GraphQL subscriptions initialize, we are given a native Request
    // not an express Request, meaning that the cookie middleware is not applied
    // to it.
    // We can fake it this way, so that cookies are easier to work with.
    // This probably isn't the best way to do this, but it does work for now
    if (!('cookies' in req)) this.addCookiesToRequest(req);
    let authCookie: string;
    if ('cookies' in req)
      // Actually an express request
      authCookie = req.cookies[this.AUTH_COOKIE_NAME];
    else {
      // Only warn if no API token and no cookies? Or consistent behavior.
      // this.logger.warn('Failed to auto-populate cookies onto request');
      return false;
    }

    const tokenQuery = req.query?.['token']?.toString();

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

  getAccessToken(user: User): string {
    return this.jwtService.sign(parse(UserSchema, user));
  }

  async login(res: Response, user: User): Promise<void> {
    const token = this.getAccessToken(user);
    res.cookie(this.AUTH_COOKIE_NAME, token, {
      domain: this.COOKIE_DOMAIN,
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.getOrThrow('secure'),
    });
  }

  async refreshUser(
    req: Request | ExpressRequest,
    res: Response,
  ): Promise<null | User> {
    const user = await this.getUserFromRequest(req);
    if (!user) return null;
    try {
      const dbUser = await this.userRepo.findOneByOrFail({
        id: user.id,
      });
      await this.login(res, dbUser);
      return dbUser;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  async linkAccount(
    id: User['id'],
    account: DeepPartial<UserAuthAccountEntity>,
  ) {
    const existingAccount = await this.userAuthAcctRepo.findOneBy({
      userId: id,
      platform: account.platform,
      platformId: account.platformId,
    });
    if (existingAccount) {
      // Sync the needed properties
      await this.userAuthAcctRepo.update(
        {
          userId: existingAccount.userId,
          platform: existingAccount.platform,
          platformId: existingAccount.platformId,
        },
        account,
      );
      return;
    }

    // Ensure that the account is properly linked to the user
    account.userId = id;
    await this.userAuthAcctRepo.save(account);
  }

  async loginByUserAccount(
    res: Response,
    userAccount: Pick<UserAuthAccountEntity, 'platform' | 'platformId'>,
  ) {
    const account = await this.userAuthAcctRepo.findOneBy({ ...userAccount });
    if (!account) return false;
    const user = await account.user;
    if (!user) return false;

    await this.login(res, user);
    return true;
  }
}
