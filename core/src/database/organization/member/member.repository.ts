import {Inject, Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository, ProfiledRepository} from "../../extended-repositories";
import {MemberProfile} from "../member_profile/member_profile.model";
import {MemberProfileRepository} from "../member_profile/member_profile.repository";
import {Member} from "./member.model";

@Injectable()
export class MemberRepository extends ExtendedRepository<Member> {
    constructor(readonly dataSource: DataSource) {
        super(Member, dataSource);
    }
}

@Injectable()
export class MemberProfiledRepository extends ProfiledRepository<Member, MemberProfile> {
    readonly profileInverseRelationshipName: "member";

    constructor(
        @Inject(MemberRepository) readonly primaryRepository: MemberRepository,
        @Inject(MemberProfileRepository) readonly profileRepository: MemberProfileRepository,
    ) {
        super();
    }
}
