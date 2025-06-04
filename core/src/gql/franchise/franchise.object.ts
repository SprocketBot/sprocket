import { Field, ObjectType } from '@nestjs/graphql';
import { ClubObject } from '../club/club.object';

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

	// Field is implicit because of ResolveField
	clubs: ClubObject[];
}
