import { AUTHZ_ENFORCER, AuthZModule } from 'nest-authz';
import { default as cookieParser } from 'cookie-parser';
import * as cookieParserAlt from 'cookie-parser';
import { User, UserSchema } from '@sprocketbot/lib/types';
import { JwtService } from '@nestjs/jwt';
import { parse } from 'valibot';
import type { Request } from 'express';
import { newEnforcer } from 'casbin';
import PostgresAdapter from 'casbin-pg-adapter';
import { Logger } from '@nestjs/common';
import { SprocketConfigService } from '@sprocketbot/lib';

const config = new SprocketConfigService();

export function getBearerToken(req: Request): string | null {
  const headers = req['headers'];
  const authHeader = headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
}

const cookieMiddleware =
  typeof cookieParser === 'function' ? cookieParser() : cookieParserAlt();
const addCookiesToRequest = (req: Request) => {
  cookieMiddleware(req as any, null, () => { });
};

const AUTH_COOKIE_NAME = 'sprocket-token';
const jwtService = new JwtService({
  secret: config.get('auth.jwt.secret') ?? 'localhost',
});
export function getUserFromRequest(req: Request): User | false {
  // When GraphQL subscriptions initialize, we are given a native Request
  // not an express Request, meaning that the cookie middleware is not applied
  // to it.
  // We can fake it this way, so that cookies are easier to work with.
  // This probably isn't the best way to do this, but it does work for now
  if (!req) return false;
  if ((req as any).user) return (req as any).user;
  let authCookie: string;
  if (!('cookies' in req)) addCookiesToRequest(req);
  if ('cookies' in req)
    // Actually an express request
    authCookie = req.cookies[AUTH_COOKIE_NAME];
  else {
    console.log('Failed to auto-populate cookies onto request');
    return false;
  }

  const tokenQuery = getBearerToken(req);

  if (!authCookie && !tokenQuery) {
    return false;
  }
  const auth = tokenQuery ? decodeURI(tokenQuery) : decodeURI(authCookie);

  try {
    const content = jwtService.verify<User>(auth);
    return parse(UserSchema, content);
  } catch (e) {
    console.log(e);
    return false;
  }
}

export const authz = AuthZModule.register({
  model: 'auth/model.conf',
  enforcerProvider: {
    provide: AUTHZ_ENFORCER,
    inject: [SprocketConfigService],
    async useFactory(cfg: SprocketConfigService) {
      const logger = new Logger(AuthZModule.name);
      logger.log('Connecting casbin via Postgres');
      const pgAdapter = await PostgresAdapter.newAdapter({
        migrate: true,
        host: cfg.getOrThrow('pg.host'),
        user: cfg.getOrThrow('pg.username'),
        password: cfg.getOrThrow('pg.password'),
        port: cfg.getOrThrow('pg.port'),
        database: cfg.getOrThrow('pg.database'),
      });

      const enforcer = await newEnforcer('auth/model.conf', pgAdapter);

      const zeroWidthSpace = 'zero-width-space ​';
      await enforcer.addRoleForUser(zeroWidthSpace, 'superuser');
      logger.log('Connected! casbin via Postgres');
      return enforcer;
    },
  },
  userFromContext: (ctx) => {
    const req = ctx.getArgs()[2]['request'];
    const user = getUserFromRequest(req);

    if (user) {
      Logger.log(`Found user from request: ${JSON.stringify(user)}.`);
      return user.id;
    } else {
      return 'anonymous';
    }
  },
});
