import { Logger } from '@nestjs/common';
import type { GetOrganizationDiscordGuildsByGuildResponse } from '@sprocketbot/common';
import { CoreEndpoint, ResponseStatus } from '@sprocketbot/common';
import type { ClientEvents, GuildMember } from 'discord.js';
import { Message } from 'discord.js';

import { ClientEvent, Command, Event, Marshal } from '../marshal';

export class DiscordSyncMarshal extends Marshal {
  private readonly logger = new Logger(DiscordSyncMarshal.name);

  @Command({
    name: 'syncme',
    docs: "Sync your name and roles from the organization's primary guild.",
    args: [],
  })
  async syncMe(m: Message): Promise<void> {
    if (!m.member) return;

    this.syncMember(m.member)
      .then(async () => m.reply('Done!'))
      .catch(async () => m.reply('Something happened...contact an admin.'));
  }

  @Event({ event: ClientEvent.guildMemberAdd })
  async guildMemberAdd([member]: ClientEvents[ClientEvent.guildMemberAdd]): Promise<void> {
    await this.syncMember(member);
  }

  @Event({ event: ClientEvent.guildMemberUpdate })
  async guildMemberUpdated([
    ,
    newMember,
  ]: ClientEvents[ClientEvent.guildMemberUpdate]): Promise<void> {
    const organizationGuilds = await this.getOrganizationDiscordGuildsByGuild(newMember.guild.id);
    if (organizationGuilds.primary !== newMember.guild.id) return;

    const primaryGuild = newMember.guild;
    const primaryGuildMember = newMember;
    const primaryGuildRoles = await primaryGuild.roles.fetch();

    const alternateGuilds = await Promise.all(
      organizationGuilds.alternate.map(async g => this.botClient.guilds.fetch(g)),
    );
    await Promise.all(alternateGuilds.map(async g => g.members.fetch(primaryGuildMember.user.id)));
    const alternateGuildsWithMember = alternateGuilds.filter(g =>
      g.members.cache.some(m => m.user.id === primaryGuildMember.user.id),
    );

    for (const alternateGuild of alternateGuildsWithMember) {
      const alternateGuildMember = await alternateGuild.members.fetch(primaryGuildMember.user.id);
      const alternateGuildRoles = await alternateGuild.roles.fetch();

      if (primaryGuildMember.displayName !== alternateGuildMember.displayName)
        alternateGuildMember.setNickname(primaryGuildMember.displayName).catch(e => {
          this.logger.error(e);
        });

      const primaryGuildRolesInAlternateGuild = primaryGuildRoles.filter(
        pgr => alternateGuildRoles.some(agr => agr.name === pgr.name) && pgr.id !== pgr.guild.id,
      );
      const alternateGuildRolesFromPrimaryGuild = primaryGuildRolesInAlternateGuild.map(
        r => alternateGuild.roles.cache.find(rr => rr.name === r.name)!,
      );
      const rolesToAdd = alternateGuildRolesFromPrimaryGuild.filter(
        r =>
          primaryGuildMember.roles.cache.some(rr => rr.name === r.name) &&
          !alternateGuildMember.roles.cache.some(rr => rr.name === r.name),
      );
      const rolesToRemove = alternateGuildRolesFromPrimaryGuild.filter(
        r =>
          !primaryGuildMember.roles.cache.some(rr => rr.name === r.name) &&
          alternateGuildMember.roles.cache.some(rr => rr.name === r.name),
      );

      await Promise.all([
        ...rolesToAdd.map(async rta => alternateGuildMember.roles.add(rta).catch(() => {})),
        ...rolesToRemove.map(async rtr => alternateGuildMember.roles.remove(rtr).catch(() => {})),
      ]).catch(e => {
        this.logger.error(e);
      });
    }
  }

  async syncMember(member: GuildMember): Promise<void> {
    const organizationGuilds = await this.getOrganizationDiscordGuildsByGuild(member.guild.id);
    if (
      !organizationGuilds.alternate.some(alternateGuildId => alternateGuildId === member.guild.id)
    )
      return;

    const primaryGuild = await this.botClient.guilds.fetch(organizationGuilds.primary);
    const primaryGuildMember = await primaryGuild.members.fetch(member.user.id);
    const primaryGuildRoles = await primaryGuild.roles.fetch();

    const alternateGuild = member.guild;
    const alternateGuildMember = member;
    const alternateGuildRoles = await alternateGuild.roles.fetch();

    if (primaryGuildMember.displayName !== alternateGuildMember.displayName)
      alternateGuildMember.setNickname(primaryGuildMember.displayName).catch(e => {
        this.logger.error(e);
      });

    const primaryGuildRolesInAlternateGuild = primaryGuildRoles.filter(
      pgr => alternateGuildRoles.some(agr => agr.name === pgr.name) && pgr.id !== pgr.guild.id,
    );
    const alternateGuildRolesFromPrimaryGuild = primaryGuildRolesInAlternateGuild.map(
      r => alternateGuild.roles.cache.find(rr => rr.name === r.name)!,
    );
    const rolesToAdd = alternateGuildRolesFromPrimaryGuild.filter(
      r =>
        primaryGuildMember.roles.cache.some(rr => rr.name === r.name) &&
        !alternateGuildMember.roles.cache.some(rr => rr.name === r.name),
    );
    const rolesToRemove = alternateGuildRolesFromPrimaryGuild.filter(
      r =>
        !primaryGuildMember.roles.cache.some(rr => rr.name === r.name) &&
        alternateGuildMember.roles.cache.some(rr => rr.name === r.name),
    );

    await Promise.all([
      ...rolesToAdd.map(async rta => alternateGuildMember.roles.add(rta).catch(() => {})),
      ...rolesToRemove.map(async rtr => alternateGuildMember.roles.remove(rtr).catch(() => {})),
    ]).catch(e => {
      this.logger.error(e);
    });
  }

  async getOrganizationDiscordGuildsByGuild(
    guildId: string,
  ): Promise<GetOrganizationDiscordGuildsByGuildResponse> {
    const response = await this.coreService.send(CoreEndpoint.GetOrganizationDiscordGuildsByGuild, {
      guildId,
    });
    if (response.status === ResponseStatus.ERROR) throw response.error;

    return response.data as GetOrganizationDiscordGuildsByGuildResponse;
  }
}
