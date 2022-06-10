import {Logger} from "@nestjs/common";
import type {GetOrganizationDiscordGuildsByGuildResponse} from "@sprocketbot/common";
import {CoreEndpoint, ResponseStatus} from "@sprocketbot/common";
import type {ClientEvents} from "discord.js";

import {
    ClientEvent, Event, Marshal,
} from "../marshal";

export class DiscordSyncMarshal extends Marshal {
    private readonly logger = new Logger(DiscordSyncMarshal.name);

    @Event({event: ClientEvent.guildMemberAdd})
    async guildMemberAdd([member]: ClientEvents[ClientEvent.guildMemberAdd]): Promise<void> {
        const orgGuilds = await this.getOrganizationDiscordGuildsByGuild(member.guild.id);
        if (!orgGuilds.alternate.some(g => g === member.guild.id)) return;

        const primaryGuild = await this.botClient.guilds.fetch(orgGuilds.primary);
        const primaryGuildRoles = await primaryGuild.roles.fetch();
        const primaryGuildMember = await primaryGuild.members.fetch(member.user.id);

        if (member.displayName !== primaryGuildMember.displayName) await member.setNickname(primaryGuildMember.displayName);

        const alternateGuildRoles = await member.guild.roles.fetch();

        const rolesIntersection = primaryGuildRoles.filter(pgr => pgr.id !== pgr.guild.id // Role is not @everyone
            && alternateGuildRoles.some(gr => gr.name === pgr.name) // Role name exists in alternate server
            && primaryGuildMember.roles.cache.has(pgr.id) // Primary guild member has primary guild role
            && !member.roles.cache.some(r => r.name === pgr.name)); // Alternate guild member does not have alternate guild role, should never happen though
        if (!rolesIntersection.size) return;

        const rolesToGive = rolesIntersection.map(pgr => alternateGuildRoles.find(agr => agr.name === pgr.name)!);

        await member.roles.add(rolesToGive);
    }

    @Event({event: ClientEvent.guildMemberUpdate})
    async guildMemberUpdate([oldMember, newMember]: ClientEvents[ClientEvent.guildMemberUpdate]): Promise<void> {
        const orgGuilds = await this.getOrganizationDiscordGuildsByGuild(newMember.guild.id);
        if (newMember.guild.id !== orgGuilds.primary) return;

        const primaryGuild = newMember.guild;
        const alternateGuilds = await Promise.all(orgGuilds.alternate.map(async g => this.botClient.guilds.fetch(g)));
        await Promise.all(alternateGuilds.map(async g => g.members.fetch()));

        const guildIntersection = alternateGuilds.filter(g => g.members.resolve(newMember.user.id));

        for (const alternateGuild of guildIntersection.values()) {
            const alternateMember = alternateGuild.members.resolve(newMember.user.id);
            if (!alternateMember) continue;

            if (alternateMember.displayName !== newMember.displayName) alternateMember.setNickname(newMember.displayName).catch(e => { this.logger.error(e) });

            const roleDifference = oldMember.roles.cache.difference(newMember.roles.cache);
            if (!roleDifference.size) continue;

            const rolesIntersection = primaryGuild.roles.cache.filter(pgr => alternateGuild.roles.cache.some(agr => agr.name === pgr.name) && roleDifference.has(pgr.id));
            if (!rolesIntersection.size) continue;

            const rolesToCheck = rolesIntersection.map(pgr => alternateGuild.roles.cache.find(agr => agr.name === pgr.name)!);

            for (const role of rolesToCheck) {
                if (newMember.roles.cache.some(r => r.name === role.name) && !alternateMember.roles.cache.some(r => r.name === role.name)) {
                    alternateMember.roles.add(role.id).catch(e => { this.logger.error(e) });
                } else if (!newMember.roles.cache.some(r => r.name === role.name) && alternateMember.roles.cache.some(r => r.name === role.name)) {
                    alternateMember.roles.remove(role.id).catch(e => { this.logger.error(e) });
                }
            }
        }
    }

    async getOrganizationDiscordGuildsByGuild(guildId: string): Promise<GetOrganizationDiscordGuildsByGuildResponse> {
        const response = await this.coreService.send(CoreEndpoint.GetOrganizationDiscordGuildsByGuild, guildId);
        if (response.status === ResponseStatus.ERROR) throw response.error;

        return response.data;
    }
}
