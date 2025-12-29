import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PlayerEntity } from '../player/player.entity';
import type { PlayerEntity as PlayerEntityType } from '../player/player.entity';

@Entity('scrim_timeout', { schema: 'sprocket' })
export class ScrimTimeoutEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PlayerEntity)
    player: PlayerEntityType;

    @Column()
    expiresAt: Date;

    @Column()
    reason: string;
}