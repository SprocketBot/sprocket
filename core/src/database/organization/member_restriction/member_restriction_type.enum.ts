import {registerEnumType} from "@nestjs/graphql";

export enum MemberRestrictionType {
    QUEUE_BAN = "QUEUE_BAN",
}

registerEnumType(MemberRestrictionType, {
    name: "MemberRestrictionType",
});
