import {
    Column, Entity, PrimaryGeneratedColumn,
} from "typeorm";

@Entity({schema: "mledb_bridge"})
export class LeagueToSkillGroup {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    league: string;

    @Column({type: "int"})
    skillGroupId: number;
}
