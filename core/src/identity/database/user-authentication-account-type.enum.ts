import {registerEnumType} from "@nestjs/graphql";

export enum UserAuthenticationAccountType {
    DISCORD = "DISCORD",
    GOOGLE = "GOOGLE",
    EPIC = "EPIC",
    STEAM = "STEAM",
    MICROSOFT = "MICROSOFT",
    XBOX = "XBOX",
}

registerEnumType(UserAuthenticationAccountType, {
    name: "UserAuthenticationAccountType",
});
