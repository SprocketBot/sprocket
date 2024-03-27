import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { SprocketConfigService } from '@sprocketbot/lib';
import { DoneCallback } from 'passport';
import { Profile, Strategy } from 'passport-discord';
import { UserAuthAccountRepository } from '../../../db/user_auth_account/user_auth_account.repository';
import { AuthPlatform } from '@sprocketbot/lib/types';
import { UserRepository } from '../../../db/user/user.repository';
import { UserAuthAccountEntity } from '../../../db/user_auth_account/user_auth_account.entity';
import { AuthorizeService } from '../../authorize/authorize.service';
import { UserEntity } from '../../../db/user/user.entity';

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
    private readonly authorizeService: AuthorizeService,
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
      const userCount = await this.userRepo.count();
      const user = await this.registerUser(profile);
      if (userCount === 0) {
        // TODO: make the created user a superuser
        await this.authorizeService.addUserToRole('superuser', user.id);
        user.active = true;
        await this.userRepo.save(user);
      }
      done(null, user);
      return null;
    } else {
      const user = await this.signIn(existingAccount, profile);
      done(null, user);
      return profile;
    }
  }

  private async signIn(
    existingAccount: UserAuthAccountEntity,
    profile: Profile,
  ) {
    const user = await existingAccount.user;
    const updatedAvatarUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
    if (existingAccount.avatarUrl !== updatedAvatarUrl) {
      // User's avatar has probably changed. Update it
      existingAccount.avatarUrl = updatedAvatarUrl;
      await this.userAuthAcctRepo.save(existingAccount);
    }
    this.logger.log(`Authenticated ${user.username} with Discord`, {
      userId: user.id,
    });
    return user;
  }

  private async registerUser(profile: Profile): Promise<UserEntity> {
    const account = this.userAuthAcctRepo.create({
      avatarUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
      platformId: profile.id,
      platformName: profile.username,
      platform: AuthPlatform.DISCORD,
    });

    // TODO: We need to try to figure out if we are linking an account or not here.
    const user = this.userRepo.create({
      username: profile.username,
      avatarUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
      active: false,
      accounts: Promise.resolve([account]),
    });

    await this.userRepo.save(user);
    account.user = Promise.resolve(user);
    await this.userAuthAcctRepo.save(account);
    this.logger.log(
      `Created disabled account for discord user ${user.username}`,
      { userId: user.id, discordId: profile.id },
    );
    return user;
  }
}
