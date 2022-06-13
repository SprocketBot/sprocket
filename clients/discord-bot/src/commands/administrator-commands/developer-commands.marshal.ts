import {Logger} from "@nestjs/common";
import {AnalyticsEndpoint} from "@sprocketbot/common";
import {Message} from "discord.js";

import {Command, Marshal} from "../../marshal";

export class DeveloperCommandsMarshal extends Marshal {
    private readonly logger = new Logger(DeveloperCommandsMarshal.name);

    @Command({
        name: "brick",
        docs: "dev.brick",
        args: [],
    })
    async brick(m: Message): Promise<void> {
        this.analyticsService.send(AnalyticsEndpoint.Analytics, {
            name: "brick",
            tags: [
                ["discordId", m.author.id],
            ],
        }).catch(err => { this.logger.error(err) });

        await m.reply(`<:sprocBrick:978054526059827280>`);
    }
}
