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
        scrims: ActiveScrims;
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
    `;

    constructor() {
        super();
        this.vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<ActiveScrimsSubscriptionValue, ActiveScrimsStoreSubscriptionVariables>) => {
        if (message?.data?.activeScrims) {
            const {scrims} = message?.data?.activeScrims ?? {};
            //if (scrim?.status === "CANCELLED" || scrim?.status === "COMPLETE") {
            //    this.currentValue.data = undefined;
            //    toasts.pushToast({
            //        status: "info",
            //        content: `Scrim ${screamingSnakeToHuman(scrim.status)}`,
            //    });
            //} else {
            //    this.currentValue.data.currentScrim = scrim;
            //}
            this.currentValue.data = {
                                        activeScrims: scrims
            }

            this.pub();
        }
    };
}

export const activeScrims = new ActiveScrimsStore();
