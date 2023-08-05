import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ScheduleFixtureObject } from "../schedule-fixture.object";
import { ScheduledEventObject } from "./schedule-event.object";
import { MatchObject } from "./match.object";
import { ScrimMetaObject } from "./scrim-meta.object";

@ObjectType()
export class MatchParentObject {
    @Field(() => Int)
    id: number;

    @Field(()=> ScheduledEventObject)
    event?: ScheduledEventObject;

    @Field(() => ScrimMetaObject)
    scrimMeta?: ScrimMetaObject;

    @Field(() => ScheduleFixtureObject)
    fixture?: ScheduleFixtureObject;

    @Field(() => MatchObject)
    match: MatchObject;
}
