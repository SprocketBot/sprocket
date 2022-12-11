import {registerEnumType} from "@nestjs/graphql";

export enum UserAuthenticationAccountType {
    DISCORD = "DISCORD",
    GOOGLE = "GOOGLE",
    EPIC = "EPIC",
    STEAM = "STEAM",
}

registerEnumType(UserAuthenticationAccountType, {
    name: "UserAuthenticationAccountType",
});
