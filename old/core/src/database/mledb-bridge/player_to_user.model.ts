import {
    Column, Entity, PrimaryGeneratedColumn,
} from "typeorm";

@Entity({schema: "mledb_bridge"})
export class PlayerToUser {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({type: "int"})
    playerId: number;

    @Column({type: "int"})
    userId: number;
}
