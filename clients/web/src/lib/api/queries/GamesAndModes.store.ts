import {gql} from "@urql/core";

import {QueryStore} from "../core/QueryStore";

export interface GamesAndModesValue {
    games: Array<{
        id: number;
        title: string;
        modes: Array<{
            id: number;
            teamSize: number;
            teamCount: number;
            description: string;
        }>;
    }>;
}

export class GamesAndModesStore extends QueryStore<GamesAndModesValue, Record<string, never>> {
    protected queryString = gql<GamesAndModesValue, Record<string, never>>`
        query {
            games: getGames {
                id
                title
                modes {
                    id
                    teamSize
                    teamCount
                    description
                }
            }
        }
    `;

    constructor() {
        super();
        this._vars = {};
    }
}

export const gamesAndModes = new GamesAndModesStore();
