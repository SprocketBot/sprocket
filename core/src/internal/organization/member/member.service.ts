import {Inject, Injectable, Logger} from "@nestjs/common";
import {EventsService, EventTopic} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import {MemberPubSub} from "../constants";

@Injectable()
export class MemberService {
    private readonly logger = new Logger(MemberService.name);

    private subscribed = false;

    constructor(private readonly eventsService: EventsService, @Inject(MemberPubSub) private readonly pubsub: PubSub) {}

    get restrictedMembersSubTopic(): string {
        return "member.restricted";
    }

    async enableSubscription(): Promise<void> {
        if (this.subscribed) return;
        this.subscribed = true;
        await this.eventsService.subscribe(EventTopic.AllMemberEvents, true).then(rx => {
            rx.subscribe(v => {
                if (typeof v.payload !== "object") {
                    return;
                }

                const payload = {eventType: 0, ...v.payload};

                switch (v.topic as EventTopic) {
                    case EventTopic.MemberRestrictionCreated:
                        payload.eventType = 1;
                        this.pubsub
                            .publish(this.restrictedMembersSubTopic, {
                                followRestrictedMembers: payload,
                            })
                            .catch(this.logger.error.bind(this.logger));
                        break;
                    case EventTopic.MemberRestrictionExpired:
                        payload.eventType = 2;
                        this.pubsub
                            .publish(this.restrictedMembersSubTopic, {
                                followRestrictedMembers: payload,
                            })
                            .catch(this.logger.error.bind(this.logger));
                        break;
                    default: {
                        break;
                    }
                }
            });
        });
    }
}
