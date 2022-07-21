import {gql} from "@urql/core";
import {QueryStore} from "../core/QueryStore";

export interface CurrentUserResult {
    me: {
        id: number;
        members: Array<{
            id: number;
            players: {
                skillGroup: {
                    game: {
                        title: string;
                    };
                };
                franchisePositions: string[];
                franchiseName: string;
            };
        }>;
    };
}

export class CurrentUserStore extends QueryStore<CurrentUserResult, {}> {
    protected queryString = gql<CurrentUserResult, {}>`
        query($orgId: Float) {
            me {
                id
                members(orgId: $orgId) {
                    id
                    players {
                        skillGroup {
                            game {
                                title
                            }
                        }
                        franchisePositions
                        franchiseName
                    }
                }
            }
        }
    `;

    constructor() {
        super();
        this._vars = {};
    }
}

export const currentUser = new CurrentUserStore();
