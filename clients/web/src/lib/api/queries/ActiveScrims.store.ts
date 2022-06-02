import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "$lib/api/core/LiveQueryStore";
import {toasts} from "$lib/components";
import {screamingSnakeToHuman} from "$lib/utils";
import type { CurrentScrim } from "./CurrentScrim.store";

export type ActiveScrims = Array<CurrentScrim>;

export interface ActiveScrimsStoreValue {
    activeScrims: ActiveScrims;
}

export interface ActiveScrimsSubscriptionValue {
    activeScrims: {
        scrim: CurrentScrim;
    };
}

export interface ActiveScrimsStoreVariables {
}

export interface ActiveScrimsStoreSubscriptionVariables {
}

class ActiveScrimsStore extends LiveQueryStore<ActiveScrimsStoreValue, ActiveScrimsStoreVariables, ActiveScrimsSubscriptionValue, ActiveScrimsStoreSubscriptionVariables> {
    protected queryString = gql<ActiveScrimsStoreValue, ActiveScrimsStoreVariables>`
    query {
        activeScrims: getActiveScrims {
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

    protected subscriptionString = gql<ActiveScrimsSubscriptionValue, ActiveScrimsStoreSubscriptionVariables>`
    subscription {
        activeScrims: followActiveScrims {
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

    protected handleGqlMessage = (message: OperationResult<ActiveScrimsSubscriptionValue, ActiveScrimsStoreSubscriptionVariables>) => {
        if (message?.data?.activeScrims) {
            const {scrim} = message?.data?.activeScrims ?? {};

            if ( !this.currentValue.data) {
                console.warn("Received subscription before query completed!");
                return;
            } 
            switch(message.data.activeScrims.scrim.status) {
                case "PENDING":
                    this.currentValue.data.activeScrims.push(scrim);
                    break;
                case "CANCELLED":
                case "COMPLETE":
                case "EMPTY":
                    this.currentValue.data.activeScrims = this.currentValue.data.activeScrims.filter(s => s.id !== scrim.id);
            }
            
            this.pub();
        }
    };
}

export const activeScrims = new ActiveScrimsStore();
