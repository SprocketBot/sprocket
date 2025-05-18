import { Field, ObjectType } from '@nestjs/graphql';
import { RoleObject } from '../role/role.object';

@ObjectType('Seat')
export class SeatObject {
  @Field()
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updateAt: Date;

  @Field()
  seat_name: string;

  @Field()
  description: string;

  @Field(() => RoleObject)
  role: RoleObject;
}
