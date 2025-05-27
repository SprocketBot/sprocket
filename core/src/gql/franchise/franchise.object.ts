import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Franchise')
export class FranchiseObject {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updateAt: Date;

	@Field()
	name: string;
}
