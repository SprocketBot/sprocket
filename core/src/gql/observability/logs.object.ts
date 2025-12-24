import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { LogsEntity, LogLevel } from '../../db/observability/logs.entity';
import { UserObject } from '../user/user.object';

registerEnumType(LogLevel, { name: 'LogLevel' });

@ObjectType('Logs')
export class LogsObject extends BaseObject {
    @Field()
    timestamp: Date;

    @Field(() => LogLevel)
    level: LogLevel;

    @Field()
    message: string;

    @Field({ nullable: true })
    context?: string;

    @Field()
    service: string;

    @Field({ nullable: true })
    method?: string;

    @Field({ nullable: true })
    path?: string;

    @Field(() => Int, { nullable: true })
    statusCode?: number;

    @Field(() => Int, { nullable: true })
    duration?: number;

    @Field({ nullable: true })
    error?: string;

    @Field({ nullable: true })
    trace?: string;

    @Field(() => UserObject, { nullable: true })
    user?: UserObject;

    @Field({ nullable: true })
    userId?: string;

    @Field({ nullable: true })
    requestId?: string;

    @Field({ nullable: true })
    traceId?: string;

    @Field({ nullable: true })
    spanId?: string;

    @Field(() => String, { nullable: true })
    tags?: string;
}
