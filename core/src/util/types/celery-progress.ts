import {
    Field, ObjectType, registerEnumType,
} from "@nestjs/graphql";
import type {Progress as IProgress} from "@sprocketbot/common";
import {ProgressStatus} from "@sprocketbot/common";

registerEnumType(ProgressStatus, {
    name: "ProgressStatus",
});

@ObjectType()
export class Progress implements IProgress {
    @Field()
    value: number;

    @Field()
    message: string;
}
