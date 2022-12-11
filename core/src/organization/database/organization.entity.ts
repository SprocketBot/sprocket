import {Entity, OneToMany, OneToOne} from "typeorm";

import {OrganizationConfigurationValue} from "../../configuration/database/organization-configuration-value.entity";
import {Verbiage} from "../../configuration/database/verbiage.entity";
import {EnabledFeature} from "../../game/database/enabled-feature.entity";
import {ScheduleGroupType} from "../../scheduling/database/schedule-group-type.entity";
import {BaseEntity} from "../../types/base-entity";
import {Member} from "./member.entity";
import {OrganizationMottos} from "./organization-mottos.entity";
import {OrganizationProfile} from "./organization-profile.entity";
import {Pronouns} from "./pronouns.entity";

@Entity({schema: "sprocket"})
export class Organization extends BaseEntity {
    @OneToOne(() => OrganizationProfile, op => op.organization)
    profile: OrganizationProfile;

    @OneToMany(() => OrganizationMottos, om => om.organization)
    mottos: OrganizationMottos[];

    @OneToMany(() => Pronouns, p => p.organization)
    pronouns: Pronouns[];

    @OneToMany(() => EnabledFeature, ef => ef.organization)
    enabledFeatures: EnabledFeature[];

    @OneToMany(() => Verbiage, v => v.organization)
    verbiages: Verbiage[];

    @OneToMany(() => OrganizationConfigurationValue, ocv => ocv.organization)
    configurationValues: OrganizationConfigurationValue[];

    @OneToMany(() => ScheduleGroupType, sgt => sgt.organization)
    scheduleGroupTypes: ScheduleGroupType[];

    @OneToMany(() => Member, m => m.organization)
    members: Member[];
}
