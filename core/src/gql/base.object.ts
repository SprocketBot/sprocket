import { Field } from '@nestjs/graphql';

export abstract class BaseObject {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updateAt: Date;
}
