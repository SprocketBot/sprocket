import {Field, ObjectType} from "@nestjs/graphql";
import {Entity, OneToMany, OneToOne} from "typeorm";

import {BaseModel} from "../../base-model";
import {OrganizationConfigurationValue} from "../../configuration/organization_configuration_value";
import {Verbiage} from "../../configuration/verbiage";
import {EnabledFeature} from "../../game/enabled_feature";
import {ScheduleGroupType} from "../../scheduling/schedule_group_type";
import {Member} from "../member/member.model";
import {OrganizationMottos} from "../organization_mottos/organization_mottos.model";
import {OrganizationProfile} from "../organization_profile/organization_profile.model";
import {Pronouns} from "../pronouns/pronouns.model";

@Entity({schema: "sprocket"})
@ObjectType()
export class Organization extends BaseModel {
    @OneToOne(() => OrganizationProfile, op => op.organization)
    @Field(() => OrganizationProfile)
    profile: OrganizationProfile;

    @OneToMany(() => OrganizationMottos, om => om.organization)
    @Field(() => [OrganizationMottos])
    mottos: OrganizationMottos[];

    @OneToMany(() => Pronouns, p => p.organization)
    @Field(() => [Pronouns])
    pronouns: Pronouns[];

    @OneToMany(() => EnabledFeature, ef => ef.organization)
    @Field(() => [EnabledFeature])
    enabledFeatures: EnabledFeature[];

    @OneToMany(() => Verbiage, v => v.organization)
    @Field(() => [Verbiage])
    verbiages: Verbiage[];

    @OneToMany(() => OrganizationConfigurationValue, ocv => ocv.organization)
    @Field(() => [OrganizationConfigurationValue])
    configurationValues: OrganizationConfigurationValue[];

    @OneToMany(() => ScheduleGroupType, sgt => sgt.organization)
    @Field(() => [ScheduleGroupType])
    scheduleGroupTypes: ScheduleGroupType[];

    @OneToMany(() => Member, m => m.organization)
    @Field(() => [Member])
    members: Member[];
}
