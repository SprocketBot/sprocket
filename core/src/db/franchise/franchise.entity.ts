import { BaseEntity } from '../base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ClubEntity } from '../club/club.entity';

@Entity('franchise', { schema: 'sprocket' })
export class FranchiseEntity extends BaseEntity {
	@Column({ unique: true })
	name: string;

	@OneToMany(() => ClubEntity, (c) => c.franchise)
	clubs: ClubEntity[];
}
