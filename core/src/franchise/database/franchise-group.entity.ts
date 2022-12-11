import {Entity, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {FranchiseGroupProfile} from "./franchise-group-profile.entity";
import {FranchiseGroupType} from "./franchise-group-type.entity";

@Entity({schema: "sprocket"})
export class FranchiseGroup extends BaseEntity {
    @ManyToOne(() => FranchiseGroup, {nullable: true})
    parentGroup?: FranchiseGroup;

    @OneToMany(() => FranchiseGroup, fg => fg.parentGroup)
    childGroups: FranchiseGroup[];

    @ManyToOne(() => FranchiseGroupType)
    type: FranchiseGroupType;

    @OneToOne(() => FranchiseGroupProfile, fp => fp.group)
    profile: FranchiseGroupProfile;
}
