import {Injectable} from "@nestjs/common";
import {EventsService, EventTopic, MemberRestrictionType} from "@sprocketbot/common";
import {DataSource, DeepPartial, FindOptionsWhere, IsNull, MoreThan} from "typeorm";

import {ExtendedRepository} from "../../extended-repositories";
import {MemberRestriction} from "./member_restriction.model";

@Injectable()
export class MemberRestrictionRepository extends ExtendedRepository<MemberRestriction> {
    constructor(readonly dataSource: DataSource, private readonly eventsService: EventsService) {
        super(MemberRestriction, dataSource);
    }

    async getActiveRestrictions(
        type: MemberRestrictionType,
        date: Date = new Date(),
        memberId?: number,
    ): Promise<MemberRestriction[]> {
        const whereA: FindOptionsWhere<MemberRestriction> = {
            type: type,
            expiration: MoreThan(date),
            manualExpiration: IsNull(),
        };
        const whereB: FindOptionsWhere<MemberRestriction> = {
            type: type,
            manualExpiration: MoreThan(new Date()),
        };

        if (memberId) {
            whereA.member = {id: memberId};
            whereB.member = {id: memberId};
        }

        return this.find({
            where: [whereA, whereB],
        });
    }

    async manuallyExpireRestriction(
        memberRestrictionId: number,
        manualExpiration: Date,
        manualExpirationReason: string,
        forgiven: boolean,
    ): Promise<MemberRestriction> {
        let memberRestriction = await this.getById(memberRestrictionId, {relations: {member: {profile: true}}});
        memberRestriction = await this.updateAndSave(memberRestrictionId, {
            manualExpiration: manualExpiration,
            manualExpirationReason: manualExpirationReason,
            forgiven: forgiven,
        });

        await this.eventsService.publish(EventTopic.MemberRestrictionExpired, memberRestriction);

        return memberRestriction;
    }

    async createAndSave(data: DeepPartial<MemberRestriction>): Promise<MemberRestriction> {
        const memberRestriction = await super.createAndSave(data);
        await this.eventsService.publish(EventTopic.MemberRestrictionCreated, memberRestriction);

        return memberRestriction;
    }
}
