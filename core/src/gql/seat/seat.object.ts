import { Field, ObjectType } from '@nestjs/graphql';
import { RoleObject } from '../role/role.object';
import { BaseObject } from '../base.object';

@ObjectType('Seat')
export class SeatObject extends BaseObject {
	@Field()
	name: string;

	@Field()
	description: string;

	// Field is implicit because of ResolveField
	role: RoleObject;
}
