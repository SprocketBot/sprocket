import {Column, Entity, ManyToOne, Unique} from "typeorm";

import {Organization} from "";
import {VerbiageCode} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
@Unique(["organization", "code"])
export class Verbiage extends BaseEntity {
    @Column()
    term: string;

    @ManyToOne(() => Organization)
    organization: Organization;

    @ManyToOne(() => VerbiageCode)
    code: VerbiageCode;
}
