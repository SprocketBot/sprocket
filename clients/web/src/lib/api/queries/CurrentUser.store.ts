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
            restrictions: Array<{
                id: number;
                expiration: Date;
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
                    restrictions(type:QUEUE_BAN, active:true) {
                        id
                        expiration
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
