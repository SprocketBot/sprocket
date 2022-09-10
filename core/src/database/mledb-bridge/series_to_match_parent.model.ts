import {
    Column, Entity, PrimaryGeneratedColumn,
} from "typeorm";

@Entity({schema: "mledb_bridge"})
export class SeriesToMatch {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({type: "int"})
    seriesId: number;

    @Column({type: "int"})
    matchId: number;
}
