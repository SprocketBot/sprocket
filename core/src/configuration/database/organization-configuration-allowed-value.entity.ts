import {Column, Entity, ManyToOne} from "typeorm";

import {OrganizationConfigurationKey} from "";

import {BaseEntity} from "../../types/base-entity";

@Entity({schema: "sprocket"})
export class OrganizationStaffTeam extends BaseEntity {
    @Column()
    value: string;

    @ManyToOne(() => OrganizationConfigurationKey)
    key: OrganizationConfigurationKey;

    @Column()
    /**
     * Indicates if the value is a regex or literal
     */
    pattern: boolean;
}
