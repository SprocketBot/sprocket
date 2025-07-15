import { Field, ID, InterfaceType } from '@nestjs/graphql';
@InterfaceType()
export abstract class BaseObject {
	@Field(() => ID)
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updateAt: Date;
}
