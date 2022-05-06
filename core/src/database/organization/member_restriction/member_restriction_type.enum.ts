import {registerEnumType} from "@nestjs/graphql";

export enum MemberRestrictionType {
    SCRIM_BAN = "SCRIM_BAN",
}

registerEnumType(MemberRestrictionType, {
    name: "MemberRestrictionType",
});
