import {Field, InputType} from "@nestjs/graphql";
import {
    IsHexColor, IsOptional, IsUrl,
} from "class-validator";


@InputType()
export class OrganizationProfileInput {
    @Field(() => String, {nullable: true})
    @IsOptional()
    @IsUrl({protocols: ["http", "https"] })
    websiteUrl?: string;

    @Field(() => String, {nullable: true})
    @IsOptional()
    @IsUrl({protocols: ["http", "https"] })
    logoUrl?: string;

    @Field(() => String, {nullable: true})
    @IsOptional()
    @IsHexColor()
    primaryColor?: string;

    @Field(() => String, {nullable: true})
    @IsOptional()
    @IsHexColor()
    secondaryColor?: string;
}
