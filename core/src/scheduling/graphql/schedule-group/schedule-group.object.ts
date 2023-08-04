import { Field, ObjectType, Int} from "@nestjs/graphql";
import { ScheduleGroupTypeObject } from "./schedule-group-type.object";
import { ScheduleFixtureObject } from "../schedule-fixture.object";
import { GameObject } from "../../../game/graphql/game.object";

@ObjectType()
export class ScheduleGroupObject {
	@Field(() => Int)
	id: number;

	@Field(() => Date)
	createdAt: Date | undefined;

	@Field(() => Date)
	updatedAt?: Date | undefined;

    @Field(() => Date)
    start: Date;

    @Field(() => Date)
    end: Date;

    @Field(() => String, {nullable: true})
    description?: string;

    @Field(() => ScheduleGroupTypeObject)
    type: ScheduleGroupTypeObject;

	@Field(() => GameObject)
    game: GameObject | undefined;

	@Field(() => ScheduleGroupObject)
    parentGroup: ScheduleGroupObject;

	@Field(() => [ScheduleGroupObject])
    childGroups: ScheduleGroupObject[];

	@Field(() => [ScheduleFixtureObject])
    fixtures: ScheduleFixtureObject[];

}
