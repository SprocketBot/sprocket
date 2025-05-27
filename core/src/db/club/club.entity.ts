import { BaseEntity } from '../base.entity';
import { Column, Entity } from 'typeorm';

@Entity('club', { schema: 'sprocket' })
export class ClubEntity extends BaseEntity {
	@Column()
	franchiseId: string;
}
