import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SprocketConfigService } from '@sprocketbot/lib';
import { DoneCallback } from 'passport';
import { Profile, Strategy } from 'passport-discord';
import { UserAuthAccountRepository } from '../../../db/user_auth_account/user_auth_account.repository';
import { AuthPlatform } from '@sprocketbot/lib/types';
import { UserRepository } from '../../../db/user/user.repository';

@Injectable()
export class DiscordStrategyService extends PassportStrategy<typeof Strategy>(
  Strategy,
  'discord',
) {
  private readonly logger = new Logger(DiscordStrategyService.name);

  constructor(
    config: SprocketConfigService,
    private readonly userAuthAcctRepo: UserAuthAccountRepository,
    private readonly userRepo: UserRepository,
  ) {
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
    const existingAccount = await this.userAuthAcctRepo.findOneBy({
      platformId: profile.id,
      platform: AuthPlatform.DISCORD,
    });

    if (!existingAccount) {
      const account = this.userAuthAcctRepo.create({
        platformId: profile.id,
        platform: AuthPlatform.DISCORD,
      });

      const user = this.userRepo.create({
        username: profile.username,
        avatarUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
        active: false,
        accounts: [account],
      });

      await this.userRepo.save(user);
      this.logger.log(
        `Created disabled account for discord user ${user.username}`,
        { userId: user.id, discordId: profile.id },
      );
      done(null, user); // failure
      return null;
    } else {
      const user = await existingAccount.user;
      const updatedAvatarUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
      if (user.avatarUrl !== updatedAvatarUrl) {
        // User's avatar has probably changed. Update it
        user.avatarUrl = updatedAvatarUrl;
        await this.userRepo.save(user);
      }
      this.logger.log(`Authenticated ${user.username} with Discord`, {
        userId: user.id,
      });
      done(null, user); // success
      return profile;
    }
  }
}
