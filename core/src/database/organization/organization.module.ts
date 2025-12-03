/* eslint-disable @typescript-eslint/naming-convention */
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Approval } from "./approval/approval.model";
import { Member } from "./member/member.model";
import { MemberPlatformAccount } from "./member_platform_account/member_platform_account.model";
import { MemberProfile } from "./member_profile/member_profile.model";
import { MemberRestriction } from "./member_restriction/member_restriction.model";
import { Organization } from "./organization/organization.model";
import { OrganizationMottos } from "./organization_mottos/organization_mottos.model";
import { OrganizationProfile } from "./organization_profile/organization_profile.model";
import { Photo } from "./photo/photo.model";
import { Pronouns } from "./pronouns/pronouns.model";

export const organizationEntities = [
    Approval,
    Organization,
    OrganizationMottos,
    OrganizationProfile,
    Member,
    MemberProfile,
    MemberPlatformAccount,
    MemberRestriction,
    Photo,
    Pronouns,
];

const ormModule = TypeOrmModule.forFeature(organizationEntities);

@Module({
    imports: [
        ormModule,
    ],
    exports: [
        ormModule,
    ],
})
export class OrganizationModule { }
