import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "$lib/api/core/LiveQueryStore";

export interface CurrentScrim {
    id: string;
    playerCount: number;
    maxPlayers: number;
    status: string;
    gameMode: {
        description: string;
    };
    settings: {
        competitive: boolean;
        mode: string;
    };
    players: Array<{
        id: number;
        name: string;
        checkedIn: boolean;
    }>;

    games: Array<{
        teams: Array<{
            players: Array<{
                id: number;
                name: string;
            }>;
        }>;
    }>;

    submissionId?: string;
}

export interface CurrentScrimStoreValue {
    currentScrim: CurrentScrim;
}

export interface CurrentScrimSubscriptionValue {
    currentScrim: {
        scrim: CurrentScrim;
    };
}


export interface CurrentScrimStoreVariables {
}

export interface CurrentScrimStoreSubscriptionVariables {
}

class CurrentScrimStore extends LiveQueryStore<CurrentScrimStoreValue, CurrentScrimStoreVariables, CurrentScrimSubscriptionValue, CurrentScrimStoreSubscriptionVariables> {
    protected queryString = gql<CurrentScrimStoreValue, CurrentScrimStoreVariables>`
    query {
        currentScrim: getCurrentScrim {
            id
            playerCount
            maxPlayers
            status
            gameMode {
                description
            }
            settings {
                competitive
                mode
            }
            players {
                id
                name
                checkedIn
            }
            games {
                teams {
                    players {
                        id
                        name
                    }
                }
            }
            submissionId
        }
    }`;

    protected subscriptionString = gql<CurrentScrimSubscriptionValue, CurrentScrimStoreSubscriptionVariables>`
    subscription {
        currentScrim: followCurrentScrim {
            scrim {
                id
                playerCount
                maxPlayers
                status
                gameMode {
                    description
                }
                settings {
                    competitive
                    mode
                }
                players {
                    id 
                    name
                    checkedIn
                }
                games {
                    teams {
                        players {
                            id
                            name
                        }
                    }
                }
                submissionId
            }
        }
    }
    `;

    constructor() {
        super();
        this.vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<CurrentScrimSubscriptionValue, CurrentScrimStoreSubscriptionVariables>) => {
        if (message?.data?.currentScrim) {
            this.currentValue.data.currentScrim = message?.data?.currentScrim.scrim;
            this.pub();
        }
    };
}

export const currentScrim = new CurrentScrimStore();
