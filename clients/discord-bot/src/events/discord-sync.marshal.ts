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
}
