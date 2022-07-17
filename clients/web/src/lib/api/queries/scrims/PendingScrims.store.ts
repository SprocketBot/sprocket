import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "../../core/LiveQueryStore";

interface PendingScrim {
    id: string;
    playerCount: number;
    maxPlayers: number;
    status: "PENDING" | "EMPTY" | "POPPED";
    gameMode: {
        description: string;
        game: {
            title: string;
        };
    };
    settings: {
        competitive: boolean;
        mode: string;
    };
}


interface PendingScrimsData {
    pendingScrims: PendingScrim[];
}

interface PendingScrimsVars {

}

interface FollowScrimsData {
    pendingScrim: PendingScrim;
}

class PendingScrimsStore extends LiveQueryStore<PendingScrimsData, PendingScrimsVars, FollowScrimsData> {
    protected queryString = gql<PendingScrimsData, PendingScrimsVars>`
    query {
        pendingScrims: getAllScrims(status: PENDING) {
            id
            playerCount
            maxPlayers
            status
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
        }
    }`;

    protected subscriptionString = gql<FollowScrimsData, {}>`
        subscription {
            pendingScrim: followPendingScrims {
                id
                playerCount
                maxPlayers
                status
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
            }
        }
    `;

    constructor() {
        super();
        // No variables needed
        this._vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<FollowScrimsData>) => {
        if (!message.data) {
            console.warn(`Recieved erroneous message from followPendingScrims: ${message.error}`);
            return;
        }
        if (!this.currentValue.data) {
            console.warn(`Recieved subscription before query completed!`);
            return;
        }
        const scrim = message.data.pendingScrim;
        let existingScrims = [...this.currentValue.data.pendingScrims];
        switch (scrim.status) {
            case "PENDING": {
                const existingScrim = existingScrims.findIndex(s => s.id === scrim.id);
                if (existingScrim >= 0) {
                    existingScrims[existingScrim] = scrim;
                } else {
                    existingScrims.push(scrim);
                }
                break;
            }
            default:
                existingScrims = existingScrims.filter(s => s.id !== scrim.id);
                break;
        }

        this.currentValue.data.pendingScrims = existingScrims;
        this.pub();
    };
}

export const pendingScrims = new PendingScrimsStore();
