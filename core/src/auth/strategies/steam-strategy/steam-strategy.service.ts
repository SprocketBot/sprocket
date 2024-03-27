import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SprocketConfigService } from '@sprocketbot/lib';
import { Strategy as SteamStrategy } from 'passport-steam';
import type { SteamProfile } from './types';

@Injectable()
export class SteamStrategyService extends PassportStrategy<
  typeof SteamStrategy
>(SteamStrategy, 'steam') {
  private readonly logger = new Logger(SteamStrategyService.name);

  constructor(config: SprocketConfigService) {
    const coreUrl = config.getOrThrow('CORE_URL');
    const protocol = config.getOrThrow('protocol');

    const port = config.getOrThrow('LISTEN_PORT');

    const domain = `${protocol}://${coreUrl}:${port}`;
    const callback = new URL(`/oauth/callback/steam`, domain);

    super({
      returnURL: callback.toString(),
      realm: new URL(domain).toString(),
      apiKey: config.get('auth.steam.apiKey'),
      profile: Boolean(config.get('auth.steam.apiKey')),
    });
  }

  async validate(id, profile: SteamProfile, done) {
    done(null, profile);
  }
}
