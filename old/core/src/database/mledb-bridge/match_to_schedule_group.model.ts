import {
    Column, Entity, PrimaryGeneratedColumn,
} from "typeorm";

@Entity({schema: "mledb_bridge"})
export class MatchToScheduleGroup {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({type: "int"})
    matchId: number;

    @Column({type: "int"})
    weekScheduleGroupId: number;
}
