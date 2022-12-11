import {Column, Entity, ManyToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {OrganizationConfigurationKey} from "./organization-configuration-key.entity";

@Entity({schema: "sprocket"})
export class OrganizationConfigurationAllowedValue extends BaseEntity {
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
