import {Injectable, Logger} from "@nestjs/common";
import type {EventResponse} from "@sprocketbot/common";
import {
    EventsService, EventTopic,
} from "@sprocketbot/common";

import {MemberService} from "./member.service";
import type {MemberRestriction} from "./member.types";

@Injectable()
export class MemberEventSubscriber {
    private readonly logger = new Logger(MemberEventSubscriber.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly memberService: MemberService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.eventsService.subscribe(EventTopic.MemberRestrictionCreated, false).then(obs => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            obs.subscribe(this.onMemberRestrictionCreated);
        });
    }

    onMemberRestrictionCreated = async (d: EventResponse<EventTopic.MemberRestrictionCreated>): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (d.topic !== EventTopic.MemberRestrictionCreated) return;

        await this.memberService.sendQueueBanNotification(d.payload.restriction as MemberRestriction).catch(e => { this.logger.error(e) });
    };
}
