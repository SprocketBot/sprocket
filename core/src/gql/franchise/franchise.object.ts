import { Field, ObjectType } from '@nestjs/graphql';
import { ClubObject } from '../club/club.object';
import { BaseObject } from '../base.object';

@ObjectType('Franchise')
export class FranchiseObject extends BaseObject {
	@Field()
	name: string;

	@Field() //to be implemented in resolver
	clubs: ClubObject[];
}
