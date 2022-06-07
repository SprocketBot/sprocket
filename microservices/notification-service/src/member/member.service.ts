import {Injectable, Logger} from "@nestjs/common";
import {
    BotEndpoint,
    BotService, CoreEndpoint, CoreService, ResponseStatus,
} from "@sprocketbot/common";
import {format, utcToZonedTime} from "date-fns-tz";

import type {MemberRestriction} from "./member.types";
import {MemberRestrictionType} from "./member.types";

@Injectable()
export class MemberService {
    private readonly logger = new Logger(MemberService.name);

    constructor(
        private readonly botService: BotService,
        private readonly coreService: CoreService,
    ) {}

    async sendQueueBanNotification(restriction: MemberRestriction): Promise<void> {
        if (restriction.type !== MemberRestrictionType.QUEUE_BAN) return;

        const memberResult = await this.coreService.send(CoreEndpoint.GetMember, restriction.member.id);
        if (memberResult.status === ResponseStatus.ERROR) throw memberResult.error;
        
        const userResult = await this.coreService.send(CoreEndpoint.GetDiscordIdByUser, memberResult.data.user.id);
        if (userResult.status === ResponseStatus.ERROR) throw userResult.error;
        if (!userResult.data) return;

        await this.botService.send(BotEndpoint.SendDirectMessage, {
            userId: userResult.data,
            content: {
                embeds: [ {
                    title: "You have been queue banned!",
                    fields: [
                        {
                            name: "Reason",
                            value: restriction.reason,
                        },
                        {
                            name: "Expiration",
                            value: format(utcToZonedTime(new Date(restriction.expiration), "America/New_York"), "MMMM do, u 'at' h:mmaaa 'ET"),
                        },
                    ],
                    timestamp: Date.now(),
                } ],
            },
            brandingOptions: {
                organizationId: memberResult.data.organization.id,
                options: {
                    color: true,
                    thumbnail: true,
                    footer: {
                        text: true,
                        icon: true,
                    },
                },
            },
        });
    }
}
