import {Column, Entity, JoinColumn, OneToOne} from "typeorm";

import {BaseEntity} from "../../types/base-entity";
import {Organization} from "./organization.entity";

@Entity({schema: "sprocket"})
export class OrganizationProfile extends BaseEntity {
    @Column()
    name: string;

    @Column()
    description: string;

    @Column({default: ""})
    websiteUrl: string;

    @Column()
    primaryColor: string;

    @Column()
    secondaryColor: string;

    @Column({nullable: true})
    logoUrl?: string;

    @OneToOne(() => Organization)
    @JoinColumn()
    organization: Organization;

    @Column()
    organizationId: number;
}
