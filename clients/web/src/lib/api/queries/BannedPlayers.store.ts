import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "$lib/api/core/LiveQueryStore";
import type {CurrentScrim} from "./CurrentScrim.store";

export type BannedPlayers = CurrentScrim[];
export interface BannedPlayersStoreValue {
    activeScrims: BannedPlayers;
}

export interface BannedPlayersSubscriptionValue {
    activeScrims: {
        scrim: CurrentScrim;
    };
}

export interface BannedPlayersStoreVariables {
}

export interface BannedPlayersStoreSubscriptionVariables {
}

export class BannedPlayersStore extends LiveQueryStore<BannedPlayersStoreValue, BannedPlayersStoreVariables, BannedPlayersSubscriptionValue, BannedPlayersStoreSubscriptionVariables> {
    protected queryString = gql<BannedPlayersStoreValue, BannedPlayersStoreVariables>`
    query {
        getActiveMemberRestrictions(type: QUEUE_BAN) {
          id
          type
          expiration
          reason
          member {
            profile {
              name
            }
          }
          memberId
        }
    }`;

    protected subscriptionString = gql<BannedPlayersSubscriptionValue, BannedPlayersStoreSubscriptionVariables>`
    subscription {
        activeScrims: followBannedPlayers {
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
            event
        }
    }
    `;

    constructor() {
        super();
        this.vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<BannedPlayersSubscriptionValue, BannedPlayersStoreSubscriptionVariables>): void => {
        if (message?.data?.activeScrims) {
            const {scrim} = message?.data?.activeScrims ?? {};

            if (!this.currentValue.data) {
                console.warn("Received subscription before query completed!");
                return;
            }

            console.log(message.data.activeScrims.event);
            const oldScrim = this.currentValue.data.activeScrims.findIndex(s => s.id === scrim.id);
            switch (message.data.activeScrims.event) {
                case "scrim.created":
                    this.currentValue.data.activeScrims.push(scrim);
                    break;
                case EventTopic.ScrimCancelled:
                case EventTopic.ScrimComplete:
                case EventTopic.ScrimDestroyed:
                    this.currentValue.data.activeScrims = this.currentValue.data.activeScrims.filter(s => s.id !== scrim.id);
                    break;
                default:
                    this.currentValue.data.activeScrims.splice(oldScrim, 1, scrim);
                    console.log("This is the update path.");
            }
            
            this.pub();
        }
    };
}

export const activeScrims = new BannedPlayersStore();
