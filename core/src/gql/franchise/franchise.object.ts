import { Field, ObjectType } from '@nestjs/graphql';
import { ClubObject } from '../club/club.object';
import { BaseObject } from '../base.object';

@ObjectType('Franchise')
export class FranchiseObject extends BaseObject {
	@Field()
	name: string;

	// Field is implicit because of ResolveField
	clubs: ClubObject[];
}
