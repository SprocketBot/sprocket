import {Inject, Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";

import {ExtendedRepository, ProfiledRepository} from "../../types/extended-repositories";
import {Member} from "./member.entity";
import type {MemberProfile} from "./member-profile.entity";
import {MemberProfileRepository} from "./member-profile.repository";

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
