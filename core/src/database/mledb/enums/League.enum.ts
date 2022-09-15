import {registerEnumType} from "@nestjs/graphql";

export enum League {
    FOUNDATION = "FOUNDATION",
    ACADEMY = "ACADEMY",
    CHAMPION = "CHAMPION",
    MASTER = "MASTER",
    PREMIER = "PREMIER",
    UNKNOWN = "UNKNOWN",
}

registerEnumType(League, {name: "MLE_League"});

export const LeagueOrdinals = [
    League.PREMIER,
    League.MASTER,
    League.CHAMPION,
    League.ACADEMY,
    League.FOUNDATION,
];
