import {Column, Entity, JoinColumn, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {FranchiseGroup} from "./franchise-group.entity";

@Entity({schema: "sprocket"})
export class FranchiseGroupProfile extends BaseEntity {
    @Column()
    name: string;

    @OneToOne(() => FranchiseGroup)
    @JoinColumn()
    group: FranchiseGroup;
}
