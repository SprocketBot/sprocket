import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity, ClubEntity } from '../internal';

@Entity('franchise', { schema: 'sprocket' })
export class FranchiseEntity extends BaseEntity {
	@Column({ unique: true })
	name: string;

	@OneToMany(() => ClubEntity, (c) => c.franchise)
	clubs: ClubEntity[];
}
