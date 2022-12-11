import {Entity, OneToMany, OneToOne} from "typeorm";

import {OrganizationConfigurationValue, Verbiage} from "";
import {EnabledFeature} from "";
import {ScheduleGroupType} from "";
import {Member} from "";
import {OrganizationMottos} from "";
import {OrganizationProfile} from "";
import {Pronouns} from "";
import {BaseEntity} from "";

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
