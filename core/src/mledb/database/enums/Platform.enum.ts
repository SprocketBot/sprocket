import {registerEnumType} from "@nestjs/graphql";

export enum MLE_Platform {
    STEAM = "STEAM",
    XBOX = "XBOX",
    PS4 = "PS4",
    EPIC = "EPIC",
}

registerEnumType(MLE_Platform, {name: "MLE_Platform"});
