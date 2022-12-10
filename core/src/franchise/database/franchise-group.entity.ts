import {Entity, ManyToOne, OneToMany, OneToOne} from "typeorm";

import {FranchiseGroupProfile} from "";
import {FranchiseGroupType} from "";

import {BaseEntity} from "../../types/base-entity";

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
