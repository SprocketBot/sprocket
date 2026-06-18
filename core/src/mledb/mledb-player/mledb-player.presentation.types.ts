import {
    Field, Float, Int, ObjectType,
} from "@nestjs/graphql";

@ObjectType()
export class MlePresentationPlayerSearchResult {
    @Field(() => Int)
    id!: number;

    @Field(() => Int)
    mleid!: number;

    @Field(() => String)
    name!: string;

    @Field(() => String, {nullable: true})
    teamName?: string;

    @Field(() => String, {nullable: true})
    league?: string;

    @Field(() => Float, {nullable: true})
    salary?: number;

    @Field(() => Boolean)
    suspended!: boolean;
}

@ObjectType()
export class MlePresentationPlayerPlatformAccount {
    @Field(() => String)
    platform!: string;

    @Field(() => String)
    platformId!: string;

    @Field(() => String, {nullable: true})
    tracker?: string;
}

@ObjectType()
export class MlePresentationPlayerDetail {
    @Field(() => Int)
    id!: number;

    @Field(() => Int)
    mleid!: number;

    @Field(() => String)
    name!: string;

    @Field(() => Float, {nullable: true})
    salary?: number;

    @Field(() => String, {nullable: true})
    teamName?: string;

    @Field(() => String, {nullable: true})
    league?: string;

    @Field(() => String, {nullable: true})
    role?: string;

    @Field(() => String, {nullable: true})
    preferredPlatform?: string;

    @Field(() => Int, {nullable: true})
    peakMmr?: number;

    @Field(() => String, {nullable: true})
    timezone?: string;

    @Field(() => String, {nullable: true})
    discordId?: string;

    @Field(() => String, {nullable: true})
    modePreference?: string;

    @Field(() => Boolean)
    suspended!: boolean;

    @Field(() => [Int])
    orgTeams!: number[];

    @Field(() => [MlePresentationPlayerPlatformAccount])
    platformAccounts!: MlePresentationPlayerPlatformAccount[];
}
