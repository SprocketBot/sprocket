import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { config } from '@sprocketbot/common';

import { DatabaseModule } from '../database';
import { UtilModule } from '../util/util.module';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { UserController, UserResolver, UserService } from './user';
import { UserAuthenticationAccountResolver } from './user-authentication-account';

@Module({
  imports: [
    DatabaseModule,
    UtilModule,
    JwtModule.register({
      secret: config.auth.jwt_secret,
      signOptions: { expiresIn: config.auth.jwt_expiry },
    }),
  ],
  providers: [IdentityService, UserResolver, UserAuthenticationAccountResolver, UserService],
  exports: [IdentityService, UserService],
  controllers: [IdentityController, UserController],
})
export class IdentityModule {}
