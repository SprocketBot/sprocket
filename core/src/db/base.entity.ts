import {
	BaseEntity as TypeormBaseEntity,
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';

export abstract class BaseEntity extends TypeormBaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updateAt: Date;
}
