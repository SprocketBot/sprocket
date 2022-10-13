/* eslint-disable @typescript-eslint/naming-convention */
import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {Approval} from "./approval";
import {Member} from "./member";
import {MemberPlatformAccount} from "./member_platform_account";
import {MemberProfile} from "./member_profile";
import {MemberRestriction} from "./member_restriction";
import {Organization} from "./organization";
import {OrganizationMottos} from "./organization_mottos";
import {OrganizationProfile} from "./organization_profile";
import {Photo} from "./photo";
import {Pronouns} from "./pronouns";

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
    imports: [ormModule],
    exports: [ormModule],
})
export class OrganizationModule {}
