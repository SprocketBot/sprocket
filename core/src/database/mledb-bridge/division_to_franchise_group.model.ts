import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({schema: "mledb_bridge"})
export class DivisionToFranchiseGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    divison: string;

    @Column({type: "int"})
    franchiseGroupId: number;
}
