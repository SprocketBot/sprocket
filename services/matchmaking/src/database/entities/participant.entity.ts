import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
// Using string-based relation to avoid circular dependency

@Entity('scrim_participants')
export class Participant {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'scrim_id' })
  scrimId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'checked_in', default: false })
  checkedIn: boolean;

  @ManyToOne('Scrim', 'participants', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scrim_id' })
  scrim: any; // Using any to avoid circular dependency, will be properly typed in the repository
}
