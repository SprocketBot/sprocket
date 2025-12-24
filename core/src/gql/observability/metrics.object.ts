import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseObject } from '../base.object';
import { MetricsEntity, MetricType } from '../../db/observability/metrics.entity';
import { UserObject } from '../user/user.object';

registerEnumType(MetricType, { name: 'MetricType' });

@ObjectType('Metrics')
export class MetricsObject extends BaseObject {
    @Field()
    timestamp: Date;

    @Field()
    name: string;

    @Field(() => Float)
    value: number;

    @Field(() => MetricType)
    type: MetricType;

    @Field({ nullable: true })
    unit?: string;

    @Field()
    service: string;

    @Field({ nullable: true })
    method?: string;

    @Field({ nullable: true })
    path?: string;

    @Field(() => String, { nullable: true })
    labels?: string;

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
}
