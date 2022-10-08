import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";

import {LiveQueryStore} from "../../core/LiveQueryStore";
import type {CurrentScrim} from "./CurrentScrim.store";

export type ActiveScrims = Array<CurrentScrim & {organizationId: number;}>;

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
        scrim: ActiveScrims[number];
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
            organizationId
            playerCount
            maxPlayers
            status
            skillGroup {
                profile {
                    description
                }
            }
            gameMode {
                description
                game {
                    title
                }
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
            playersAdmin {
                id
                name
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
                organizationId
                playerCount
                maxPlayers
                status
                skillGroup {
                    profile {
                        description
                    }
                }
                gameMode {
                    description
                    game {
                        title
                    }
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
                playersAdmin {
                    id
                    name
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

    protected handleGqlMessage = (message: OperationResult<ActiveScrimsSubscriptionValue, ActiveScrimsStoreSubscriptionVariables>): void => {
        if (message?.data?.activeScrims) {
            const {scrim} = message?.data?.activeScrims ?? {};

            if (!this.currentValue.data) {
                console.warn("Received subscription before query completed!");
                return;
            }

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
            }

            this.pub();
        }
    };
}

export const activeScrims = new ActiveScrimsStore();
