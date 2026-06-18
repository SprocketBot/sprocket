import {Field, Float, Int, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class MlePresentationFranchiseStaff {
    @Field(() => Int)
    id!: number;

    @Field(() => String)
    name!: string;

    @Field(() => String)
    role!: string;
}

@ObjectType()
export class MlePresentationFranchiseBranding {
    @Field(() => String, {nullable: true})
    logo?: string;

    @Field(() => String, {nullable: true})
    primaryColor?: string;

    @Field(() => String, {nullable: true})
    secondaryColor?: string;
}

@ObjectType()
export class MlePresentationFranchiseRosterPlayer {
    @Field(() => Int)
    id!: number;

    @Field(() => Int)
    mleid!: number;

    @Field(() => String)
    name!: string;

    @Field(() => String, {nullable: true})
    role?: string;

    @Field(() => String, {nullable: true})
    league?: string;

    @Field(() => Float)
    salary!: number;
}

@ObjectType()
export class MlePresentationFranchiseDetail {
    @Field(() => String)
    name!: string;

    @Field(() => String)
    callsign!: string;

    @Field(() => String, {nullable: true})
    division?: string;

    @Field(() => String, {nullable: true})
    conference?: string;

    @Field(() => MlePresentationFranchiseBranding, {nullable: true})
    branding?: MlePresentationFranchiseBranding;

    @Field(() => MlePresentationFranchiseStaff, {nullable: true})
    franchiseManager?: MlePresentationFranchiseStaff;

    @Field(() => [MlePresentationFranchiseStaff])
    generalManagers!: MlePresentationFranchiseStaff[];

    @Field(() => [MlePresentationFranchiseStaff])
    assistantGeneralManagers!: MlePresentationFranchiseStaff[];

    @Field(() => [MlePresentationFranchiseStaff])
    captains!: MlePresentationFranchiseStaff[];

    @Field(() => [MlePresentationFranchiseRosterPlayer])
    roster!: MlePresentationFranchiseRosterPlayer[];

    @Field(() => Int)
    totalSalaryCap!: number;

    @Field(() => Int)
    usedSalary!: number;

    @Field(() => Int)
    remainingSalary!: number;
}

@ObjectType()
export class MlePresentationFranchiseSummary {
    @Field(() => String)
    name!: string;

    @Field(() => String)
    callsign!: string;

    @Field(() => String, {nullable: true})
    division?: string;

    @Field(() => Int)
    rosterCount!: number;

    @Field(() => Int)
    usedSalary!: number;
}