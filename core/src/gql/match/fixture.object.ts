import { Field, ObjectType } from '@nestjs/graphql';
import { MatchObject } from './match.object';
import { FranchiseObject } from '../franchise/franchise.object';

@ObjectType('Fixture')
export class FixtureObject extends MatchObject {
    @Field(() => FranchiseObject)
    homeFranchise: FranchiseObject;

    @Field(() => FranchiseObject)
    awayFranchise: FranchiseObject;
}
