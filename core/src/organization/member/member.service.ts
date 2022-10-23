import {forwardRef, Inject, Injectable, Logger} from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {EventsService, EventTopic} from "@sprocketbot/common";
import {PubSub} from "apollo-server-express";

import type {Franchise} from "$models";

import {PlayerService} from "../../franchise/player/player.service";
import {MemberPubSub} from "../constants";

@Injectable()
export class MemberService {
    private readonly logger = new Logger(MemberService.name);

    private subscribed = false;

    constructor(
        private readonly eventsService: EventsService,
        @Inject(forwardRef(() => PlayerService))
        private readonly playerService: PlayerService,
        @Inject(MemberPubSub) private readonly pubsub: PubSub,
    ) {}

    get restrictedMembersSubTopic(): string {
        return "member.restricted";
    }

    async getFranchiseByMember(
        memberId: number,
        organizationId: number,
        gameId: number,
    ): Promise<Franchise | undefined> {
        const player = await this.playerService.getPlayer({
            where: {
                member: {
                    id: memberId,
                    organization: {
                        id: organizationId,
                    },
                },
                skillGroup: {
                    game: {
                        id: gameId,
                    },
                },
            },
            relations: [
                "member",
                "member.user",
                "member.organization",
                "skillGroup",
                "skillGroup.game",
                "slot",
                "slot.team",
                "slot.team.franchise",
            ],
        });

        return player.slot?.team.franchise;
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
