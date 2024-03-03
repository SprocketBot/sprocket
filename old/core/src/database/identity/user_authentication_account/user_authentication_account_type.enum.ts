import {registerEnumType} from "@nestjs/graphql";

export enum UserAuthenticationAccountType {
    DISCORD = "DISCORD",
    GOOGLE = "GOOGLE",
}

registerEnumType(UserAuthenticationAccountType, {
    name: "UserAuthenticationAccountType",
});
