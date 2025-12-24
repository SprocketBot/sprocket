import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { MatchSubmissionEntity, SubmissionStatus } from '../../db/submission/match_submission.entity';
import { MatchObject } from '../match/match.object';
import { UserObject } from '../user/user.object';

registerEnumType(SubmissionStatus, { name: 'SubmissionStatus' });

@ObjectType('MatchSubmission')
export class MatchSubmissionObject extends BaseObject {
    @Field(() => MatchObject)
    match: MatchObject;

    @Field(() => UserObject)
    submittedBy: UserObject;

    @Field(() => SubmissionStatus)
    status: SubmissionStatus;

    @Field(() => String)
    submittedData: string;

    @Field()
    submittedAt: Date;

    @Field({ nullable: true })
    reviewedAt?: Date;

    @Field(() => UserObject, { nullable: true })
    reviewedBy?: UserObject;

    @Field({ nullable: true })
    rejectionReason?: string;
}
