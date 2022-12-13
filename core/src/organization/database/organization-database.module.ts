import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {EventsModule} from "@sprocketbot/common";

import {Approval} from "./approval.entity";
import {ApprovalRepository} from "./approval.repository";
import {Member} from "./member.entity";
import {MemberProfiledRepository, MemberRepository} from "./member.repository";
import {MemberProfile} from "./member-profile.entity";
import {MemberProfileRepository} from "./member-profile.repository";
import {MemberRestriction} from "./member-restriction.entity";
import {MemberRestrictionRepository} from "./member-restriction.repository";
import {Organization} from "./organization.entity";
import {OrganizationProfiledRepository, OrganizationRepository} from "./organization.repository";
import {OrganizationMottos} from "./organization-mottos.entity";
import {OrganizationMottosRepository} from "./organization-mottos.repository";
import {OrganizationProfile} from "./organization-profile.entity";
import {OrganizationProfileRepository} from "./organization-profile.repository";
import {Photo} from "./photo.entity";
import {PhotoRepository} from "./photo.repository";
import {Pronouns} from "./pronouns.entity";
import {PronounsRepository} from "./pronouns.repository";

const ormModule = TypeOrmModule.forFeature([
    Approval,
    Member,
    MemberProfile,
    MemberRestriction,
    Organization,
    OrganizationMottos,
    OrganizationProfile,
    Photo,
    Pronouns,
]);

const providers = [
    ApprovalRepository,
    MemberRepository,
    MemberProfileRepository,
    MemberProfiledRepository,
    MemberRestrictionRepository,
    OrganizationRepository,
    OrganizationMottosRepository,
    OrganizationProfileRepository,
    OrganizationProfiledRepository,
    PhotoRepository,
    PronounsRepository,
];

@Module({
    imports: [ormModule, EventsModule],
    providers: providers,
    exports: providers,
})
export class OrganizationDatabaseModule {}
