import {Logger} from "@nestjs/common";
import type {ClientEvents} from "discord.js";

import {
    ClientEvent, Event, Marshal,
} from "../marshal";

export class DiscordSyncMarshal extends Marshal {
    private readonly logger = new Logger(DiscordSyncMarshal.name);

    @Event({event: ClientEvent.guildMemberAdd})
    async guildMemberAdd([member]: ClientEvents[ClientEvent.guildMemberAdd]): Promise<void> {
        this.logger.log(member.displayName);
    }

    @Event({event: ClientEvent.guildMemberAdd})
    async guildMemberUpdate([oldMember, newMember]: ClientEvents[ClientEvent.guildMemberUpdate]): Promise<void> {
        this.logger.log(oldMember.displayName, newMember.displayName);
    }
}
