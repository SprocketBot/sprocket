import {registerEnumType} from "@nestjs/graphql";

export enum ModePreference {
    DOUBLES_ONLY = "DOUBLES_ONLY",
    STANDARD_ONLY = "STANDARD_ONLY",
    BOTH = "BOTH",
    PREFER_2S = "PREFER_2S",
    PREFER_3S = "PREFER_3S",
}

registerEnumType(ModePreference, {name: "MLE_ModePreference"});
