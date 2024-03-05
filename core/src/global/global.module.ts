import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SprocketConfigService } from '@sprocketbot/lib';

@Global()
@Module({
  exports: [JwtModule],
  imports: [
    JwtModule.registerAsync({
      inject: [SprocketConfigService],
      useFactory: (cfg: SprocketConfigService) => {
        console.log(cfg.getOrThrow('auth.jwt.expiry'));
        return {
          secret: cfg.getOrThrow('auth.jwt.secret'),
          signOptions: {
            expiresIn: cfg.getOrThrow('auth.jwt.expiry'),
          },
        };
      },
    }),
  ],
})
export class GlobalModule {}
