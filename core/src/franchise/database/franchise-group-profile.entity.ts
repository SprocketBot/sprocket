import {Column, Entity, JoinColumn, OneToOne} from "typeorm";

import {FranchiseGroup} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class FranchiseGroupProfile extends BaseEntity {
    @Column()
    name: string;

    @OneToOne(() => FranchiseGroup)
    @JoinColumn()
    group: FranchiseGroup;
}
