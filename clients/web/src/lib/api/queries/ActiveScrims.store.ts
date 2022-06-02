import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "$lib/api/core/LiveQueryStore";
import {toasts} from "$lib/components";
import {screamingSnakeToHuman} from "$lib/utils";
import type { CurrentScrim } from "./CurrentScrim.store";
import { SingleFieldSubscriptionsRule } from "graphql";

export type ActiveScrims = Array<CurrentScrim>;

enum EventTopic {
    // Scrims
    AllScrimEvents = "scrim.*",
    ScrimComplete = "scrim.complete",
    ScrimPopped = "scrim.popped",
    ScrimCreated = "scrim.created",
    ScrimUpdated = "scrim.updated",
    ScrimDestroyed = "scrim.destroyed",
    ScrimStarted = "scrim.started",
    ScrimCancelled = "scrim.cancelled",
    ScrimMetricsUpdate = "scrim.metricsUpdate",

    // Submissions
    SubmissionStarted = "submission.started",
}

export interface ActiveScrimsStoreValue {
    activeScrims: ActiveScrims;
}

export interface ActiveScrimsSubscriptionValue {
    activeScrims: {
        scrim: CurrentScrim;
        event: EventTopic;
    };
}

export interface ActiveScrimsStoreVariables {
}

export interface ActiveScrimsStoreSubscriptionVariables {
}

export class ActiveScrimsStore extends LiveQueryStore<ActiveScrimsStoreValue, ActiveScrimsStoreVariables, ActiveScrimsSubscriptionValue, ActiveScrimsStoreSubscriptionVariables> {
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
            event
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

            console.log(message.data.activeScrims.event);
            switch(message.data.activeScrims.event) {
                //ScrimComplete = "scrim.complete",
                //ScrimPopped = "scrim.popped",
                //ScrimCreated = "scrim.created",
                //ScrimUpdated = "scrim.updated",
                //ScrimDestroyed = "scrim.destroyed",
                //ScrimStarted = "scrim.started",
                //ScrimCancelled = "scrim.cancelled",
                //ScrimMetricsUpdate = "scrim.metricsUpdate"
                //case "PENDING":
                case "scrim.created":
                    this.currentValue.data.activeScrims.push(scrim);
                    break;
                //case "CANCELLED":
                //case "COMPLETE":
                //case "EMPTY":
                //case "DESTROYED":
                case EventTopic.ScrimCancelled:
                case EventTopic.ScrimComplete:
                case EventTopic.ScrimDestroyed:
                    this.currentValue.data.activeScrims = this.currentValue.data.activeScrims.filter(s => s.id !== scrim.id);
                    break;
                default:
                    let oldScrim = this.currentValue.data.activeScrims.findIndex(s => s.id === scrim.id);
                    this.currentValue.data.activeScrims.splice(oldScrim, 1, scrim);
                    console.log("This is the update path.");
            }
            
            this.pub();
        }
    };
}

export const activeScrims = new ActiveScrimsStore();
