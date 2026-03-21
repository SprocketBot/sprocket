import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { BaseObject } from '../base.object';
import {
    MatchSubmissionEntity,
    ReplaySubmissionItemEntity,
    ReplaySubmissionItemStatus,
    ReplaySubmissionRejectionEntity,
    ReplaySubmissionRatifierEntity,
    ReplaySubmissionType,
    SubmissionStatus,
} from '../../db/internal';
import { MatchObject } from '../match/match.object';
import { UserObject } from '../user/user.object';

registerEnumType(SubmissionStatus, { name: 'SubmissionStatus' });
registerEnumType(ReplaySubmissionType, { name: 'ReplaySubmissionType' });
registerEnumType(ReplaySubmissionItemStatus, { name: 'ReplaySubmissionItemStatus' });

@ObjectType('ReplaySubmissionItem')
export class ReplaySubmissionItemObject extends BaseObject {
    @Field(() => String)
    taskId: string;

    @Field(() => String)
    originalFilename: string;

    @Field(() => String)
    inputPath: string;

    @Field(() => String, { nullable: true })
    outputPath?: string;

    @Field(() => ReplaySubmissionItemStatus)
    status: ReplaySubmissionItemStatus;

    @Field(() => Number)
    progressValue: number;

    @Field(() => String)
    progressMessage: string;

    @Field(() => String, { nullable: true })
    error?: string;
}

@ObjectType('ReplaySubmissionRejection')
export class ReplaySubmissionRejectionObject extends BaseObject {
    @Field(() => String)
    playerId: string;

    @Field(() => String, { nullable: true })
    playerName?: string;

    @Field(() => String)
    reason: string;

    @Field(() => Boolean)
    stale: boolean;
}

@ObjectType('ReplaySubmissionRatifier')
export class ReplaySubmissionRatifierObject extends BaseObject {
    @Field(() => String, { nullable: true })
    userId?: string;

    @Field(() => String, { nullable: true })
    franchiseId?: string;

    @Field(() => String, { nullable: true })
    franchiseName?: string;

    @Field(() => Date)
    ratifiedAt: Date;
}

@ObjectType('MatchSubmission')
export class MatchSubmissionObject extends BaseObject {
    @Field(() => MatchObject, { nullable: true })
    match?: MatchObject;

    @Field(() => UserObject)
    submittedBy: UserObject;

    @Field(() => SubmissionStatus)
    status: SubmissionStatus;

    @Field(() => ReplaySubmissionType)
    submissionType: ReplaySubmissionType;

    @Field(() => GraphQLJSON)
    submittedData: MatchSubmissionEntity['submittedData'];

    @Field(() => GraphQLJSON, { nullable: true })
    stats?: MatchSubmissionEntity['stats'];

    @Field(() => [ReplaySubmissionItemObject], { nullable: true })
    items?: ReplaySubmissionItemEntity[];

    @Field(() => [ReplaySubmissionRejectionObject], { nullable: true })
    rejections?: ReplaySubmissionRejectionEntity[];

    @Field(() => [ReplaySubmissionRatifierObject], { nullable: true })
    ratifiers?: ReplaySubmissionRatifierEntity[];

    @Field()
    submittedAt: Date;

    @Field({ nullable: true })
    reviewedAt?: Date;

    @Field(() => UserObject, { nullable: true })
    reviewedBy?: UserObject;

    @Field({ nullable: true })
    rejectionReason?: string;
}
