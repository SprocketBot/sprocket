import {Column, Entity, OneToMany} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {FranchiseGroup} from "./franchise-group.entity";

@Entity({schema: "sprocket"})
export class FranchiseGroupType extends BaseEntity {
    @Column()
    code: string;

    @Column()
    description: string;

    @OneToMany(() => FranchiseGroup, fg => fg.type)
    franchiseGroups: FranchiseGroup[];
}
