import {Injectable, Logger} from "@nestjs/common";
import type {EventResponse} from "@sprocketbot/common";
import {
    EventsService, EventTopic,
} from "@sprocketbot/common";

import {MemberService} from "./member.service";

@Injectable()
export class MemberEventSubscriber {
    private readonly logger = new Logger(MemberEventSubscriber.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly memberService: MemberService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.eventsService.subscribe(EventTopic.MemberRestrictionCreated, false).then(obs => {
            obs.subscribe(this.onMemberRestrictionCreated);
        });
    }

    onMemberRestrictionCreated = (d: EventResponse<EventTopic.MemberRestrictionCreated>): void => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (d.topic !== EventTopic.MemberRestrictionCreated) return;

        this.memberService.sendQueueBanNotification(d.payload).catch(e => { this.logger.error(e) });
    };
}
