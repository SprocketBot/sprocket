import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AUTHZ_ENFORCER, AuthZModule } from 'nest-authz';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { GlobalModule } from './global/global.module';
import type { Request } from 'express';
import { newEnforcer } from 'casbin';
import PostgresAdapter from 'casbin-pg-adapter';
import { AuthAction, AuthScope, AuthTarget } from './auth/constants';
import { SprocketConfigModule, SprocketConfigService } from '@sprocketbot/lib';

@Module({
  imports: [
    SprocketConfigModule(),
    AuthZModule.register({
      model: 'auth/model.conf',
      policy: 'auth/policy.csv',
      enforcerProvider: {
        provide: AUTHZ_ENFORCER,
        inject: [SprocketConfigService],
        async useFactory(cfg: SprocketConfigService) {
          const pgAdapter = await PostgresAdapter.newAdapter({
            migrate: true,
            host: cfg.getOrThrow('pg.host'),
            user: cfg.getOrThrow('pg.username'),
            password: cfg.getOrThrow('pg.password'),
            port: cfg.getOrThrow('pg.port'),
          });

          const enforcer = await newEnforcer('auth/model.conf', pgAdapter);

          // Initial Setup
          // TODO: Set up a super-user configuration method
          // Should use https://casbin.org/docs/rbac-with-pattern to get all permissions
          // Could technically loop through AuthTarget AuthAction and AuthScope to get all permissions, but that feels extreme.
          await Promise.all(
            [
              [
                'superuser',
                AuthTarget.USER,
                `${AuthAction.READ}:${AuthScope.SELF}`,
                'Sprocket',
              ],
              [
                'superuser',
                AuthTarget.USER,
                `${AuthAction.READ}:${AuthScope.ALL}`,
                'Sprocket',
              ],
            ].map((v) => enforcer.addPolicy(...v)),
          );

          await enforcer.addRoleForUser('shuckle', 'superuser', 'Sprocket');
          return enforcer;
        },
      },
      usernameFromContext: (ctx) =>
        ctx.switchToHttp().getRequest<Request>().user.username,
    }),
    PassportModule,
    AuthModule,
    GlobalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
