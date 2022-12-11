import {Column, Entity, ManyToOne, Unique} from "typeorm";

import {Organization} from "../../organization/database/organization.entity";
import {BaseEntity} from "../../types/base-entity";
import {VerbiageCode} from "./verbiage-code.entity";

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
