import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';

@ObjectType('Role')
export class RoleObject extends BaseObject {
	@Field()
	name: string;
}
