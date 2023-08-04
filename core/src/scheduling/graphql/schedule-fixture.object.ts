import { Field, ObjectType, Int} from "@nestjs/graphql";
import { ScheduleGroupObject } from "./schedule-group/schedule-group.object";
import { FranchiseObject } from "../../franchise/graphql/franchise.object";

@ObjectType()
export class ScheduleFixtureObject {
	@Field(() => Int)
	id: number;

	@Field(() => Date)
	createdAt: Date | undefined;

	@Field(() => Date)
	updatedAt?: Date | undefined;

    @Field(() => ScheduleGroupObject)
    scheduleGroup: ScheduleGroupObject;

    @Field(() => FranchiseObject)
    homeFranchise: FranchiseObject;

    @Field(() => FranchiseObject)
    awayFranchise: FranchiseObject;

    //@OneToMany(() => MatchParent, mp => mp.fixture)
    //matchParents: MatchParent[];

    @Field(() => Int)
    awayFranchiseId: number;

    @Field(() => Int)
    homeFranchiseId: number;

}
