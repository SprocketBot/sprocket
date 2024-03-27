// import { Injectable, Logger } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { SprocketConfigService } from '@sprocketbot/lib';
// import Strategy from 'passport-steam';
// import { UserRepository } from '../../../db/user/user.repository';
// import { UserAuthAccountRepository } from '../../../db/user_auth_account/user_auth_account.repository';
// import { AuthPlatform } from '@sprocketbot/lib/types';
// import type { SteamProfile } from './types';

// @Injectable()
// export class MicrosoftStrategyService extends PassportStrategy<typeof Strategy>(
//   Strategy,
//   'steam',
// ) {
//   private readonly logger = new Logger(MicrosoftStrategyService.name);

//   constructor(
//     config: SprocketConfigService,
//     private readonly userAuthAcctRepo: UserAuthAccountRepository,
//     private readonly userRepo: UserRepository,
//   ) {
//     const coreUrl = config.getOrThrow('CORE_URL');
//     const protocol = config.getOrThrow('protocol');

//     const port = config.getOrThrow('LISTEN_PORT');

//     const domain = `${protocol}://${coreUrl}:${port}`;
//     const callback = new URL(`/oauth/callback/steam`, domain);

//     super({
//       returnURL: callback.toString(),
//       realm: domain,
//       apiKey: config.get('auth.steam.apiKey'),
//       profile: Boolean(config.get('auth.steam.apiKey')),
//     });
//   }

//   async validate(id, profile: SteamProfile, done) {
//     done(null, profile);
//   }
// }
