import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SprocketConfigService } from '@sprocketbot/lib';
import { DoneCallback } from 'passport';
import { Profile, Strategy } from 'passport-discord';

@Injectable()
export class DiscordStrategyService extends PassportStrategy<typeof Strategy>(
  Strategy,
  'discord',
) {
  constructor(config: SprocketConfigService) {
    const coreUrl = config.getOrThrow('CORE_URL');
    const protocol = config.getOrThrow('protocol');

    const port = config.getOrThrow('LISTEN_PORT');

    const callback = new URL(
      `/oauth/callback/discord`,
      `${protocol}://${coreUrl}:${port}`,
    );

    const cfg = {
      clientID: config.getOrThrow('auth.discord.clientId'),
      clientSecret: config.getOrThrow('auth.discord.secret'),
      callbackURL: callback.toString(),
      scope: ['identify', 'email'],
      prompt: 'none',
    };
    super(cfg);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: DoneCallback,
  ) {
    done('', profile);
    return profile;
  }
}
