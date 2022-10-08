import {gql} from "@urql/core";

import {QueryStore} from "../../core/QueryStore";
import type {FeatureCode} from "./feature.types";

export interface GameFeatureResult {
    getFeatureEnabled: boolean;
}

export interface GameFeatureVariables {
    code: FeatureCode;
    gameId: number;
}

export class GameFeatureStore extends QueryStore<GameFeatureResult, GameFeatureVariables> {
    protected queryString = gql<GameFeatureResult, GameFeatureVariables>`
        query ($code: FeatureCode!, $gameId: Float!) {
            getFeatureEnabled(code: $code, gameId: $gameId)
        }
    `;

    constructor(vars: GameFeatureVariables) {
        super();
        this._vars = vars;
    }
}
