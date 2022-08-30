import {gql} from "@urql/core";
import {QueryStore} from "../core/QueryStore";

export interface CurrentUserResult {
    me: {
        id: number;
        members: Array<{
            id: number;
            players: Array<{
                skillGroup: {
                    profile: {
                        description: string;
                    };
                    game: {
                        title: string;
                    };
                };
                franchisePositions: string[];
                franchiseName: string;
            }>;
        }>;
    };
}

export interface CurrentUserVars {
    orgId?: number;
}

export class CurrentUserStore extends QueryStore<CurrentUserResult, CurrentUserVars> {
    protected queryString = gql<CurrentUserResult, CurrentUserVars>`
        query($orgId: Float) {
            me {
                id
                members(orgId: $orgId) {
                    id
                    players {
                        
                        skillGroup {
                            profile {
                                description
                            }
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
