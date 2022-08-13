import {registerEnumType} from "@nestjs/graphql";

export enum FeatureCode {
    /**
     * Automatically run salaries every Monday at noon.
     */
    AUTO_SALARIES = "AUTO_SALARIES",
    /**
     * Automatically run rankouts every Monday at noon. (Should be a dependent of AUTO_SALARIES)
     */
    AUTO_RANKOUTS = "AUTO_RANKOUTS",
}

registerEnumType(FeatureCode, {
    name: "FeatureCode",
});
