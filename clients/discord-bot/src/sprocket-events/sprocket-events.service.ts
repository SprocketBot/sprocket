import {Inject, Injectable} from "@nestjs/common";
import {
    CoreEndpoint,
    CoreService,
    EventsService,
    EventTopic,
    PlayerSkillGroupChangedType,
    PlayerTeamChanged,
    ResponseStatus,
    SprocketEvent,
    SprocketEventMarshal,
} from "@sprocketbot/common";
import {Client} from "discord.js";

@Injectable()
export class SprocketEventsService extends SprocketEventMarshal {
    constructor(
        readonly eventsService: EventsService,
        @Inject("DISCORD_CLIENT") private readonly discordClient: Client,
        private readonly coreService: CoreService,
    ) {
        super(eventsService);
    }

    @SprocketEvent(EventTopic.PlayerSkillGroupChanged)
    async onSkillGroupChange(payload: PlayerSkillGroupChangedType): Promise<void> {
        const response = await this.coreService.send(CoreEndpoint.GetGuildsByOrganizationId, {
            organizationId: payload.organizationId,
        });
        if (response.status === ResponseStatus.ERROR) throw response.error;
        const {primary} = response.data;

        // If organization does not have a primary guild, no roles to update
        if (!primary) return;

        // Find guild and member
        const guild = await this.discordClient.guilds.fetch(primary);
        const member = await guild.members.fetch(payload.discordId);
        const roles = await guild.roles.fetch();

        // Remove old rank role and add new
        const oldRoleName = payload.old.name;
        const oldRole = roles.find(r => r.name === oldRoleName);
        const newRoleName = payload.new.name;
        const newRole = roles.find(r => r.name === newRoleName);

        if (!oldRole) throw new Error(`Couldn't find role with name '${oldRoleName}' in guild with id '${primary}'`);
        if (!newRole) throw new Error(`Couldn't find role with name '${newRoleName}' in guild with id '${primary}'`);

        await member.roles.remove(oldRole.id);
        await member.roles.add(newRole.id);
    }

    @SprocketEvent(EventTopic.PlayerTeamChanged)
    async onTeamChange(payload: PlayerTeamChanged): Promise<void> {
        const response = await this.coreService.send(CoreEndpoint.GetGuildsByOrganizationId, {
            organizationId: payload.organizationId,
        });
        if (response.status === ResponseStatus.ERROR) throw response.error;
        const {primary} = response.data;

        // If organization does not have a primary guild, no roles to update
        if (!primary) return;

        // Find guild and member
        const guild = await this.discordClient.guilds.fetch(primary);
        const member = await guild.members.fetch(payload.discordId);
        const roles = await guild.roles.fetch();

        // Remove old team role and add new
        const oldRoleName = payload.old.name;
        const oldRole = roles.find(r => r.name === oldRoleName);
        const newRoleName = payload.new.name;
        const newRole = roles.find(r => r.name === newRoleName);

        if (!oldRole) throw new Error(`Couldn't find role with name '${oldRoleName}' in guild with id '${primary}'`);
        if (!newRole) throw new Error(`Couldn't find role with name '${newRoleName}' in guild with id '${primary}'`);

        await member.roles.remove(oldRole.id);
        await member.roles.add(newRole.id);

        // Set team on nickname
        // TODO not always Waiver Wire
        const teamCode = "WW";
        await member.setNickname(`${teamCode} | ${payload.name}`);
    }
}
