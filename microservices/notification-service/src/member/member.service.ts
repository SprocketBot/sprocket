import {Injectable, Logger} from "@nestjs/common";
import type {MemberRestriction} from "@sprocketbot/common";
import {
    BotEndpoint,
    BotService,
    CoreEndpoint,
    CoreService,
    MemberRestrictionType,
    ResponseStatus,
} from "@sprocketbot/common";
import {format, utcToZonedTime} from "date-fns-tz";

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
            payload: {
                embeds: [ {
                    title: "You've Been Queue Banned",
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
