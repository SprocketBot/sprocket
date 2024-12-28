import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "../../core/LiveQueryStore";

export interface LFSScrim {
    id: string;
    playerCount: number;
    maxPlayers: number;
    status: "PENDING" | "EMPTY" | "POPPED";
    createdAt: Date;
    gameMode: {
        description: string;
        game: {
            title: string;
        };
    };
    settings: {
        competitive: boolean;
        mode: "TEAMS" | "ROUND_ROBIN";
    };
    skillGroup: {
        profile: {
            description: string;
        };
    };
}


interface LFSScrimsData {
    LFSScrims: LFSScrim[];
}

interface LFSScrimsVars {

}

interface LFSScrimsSub {
    LFSScrim: LFSScrim;
}

class LFSScrimsStore extends LiveQueryStore<LFSScrimsData, LFSScrimsVars, LFSScrimsSub> {
    protected queryString = gql<LFSScrimsData, LFSScrimsVars>`
    query {
        LFSScrims: getLFSScrims() {
            id
            playerCount
            maxPlayers
            status
            createdAt
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
            skillGroup {
                profile {
                    description
                }
            }
        }
    }`;

    protected subscriptionString = gql<LFSScrimsSub, {}>`
        subscription {
            LFSScrim: followLFSScrims {
                id
                playerCount
                maxPlayers
                status
                createdAt
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
                skillGroup {
                    profile {
                        description
                    }
                }
            }
        }
    `;
    
    protected _subVars = {};

    constructor() {
        super();
        // No variables needed
        this._vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<LFSScrimsSub>) => {
        if (!message.data) {
            console.warn(`Recieved erroneous message from followLFSScrims: ${message.error}`);
            return;
        }
        if (!this.currentValue.data) {
            console.warn(`Recieved subscription before query completed!`);
            return;
        }
        const scrim = message.data.LFSScrim;
        const existingScrims = [...this.currentValue.data.LFSScrims];
        const existingScrim = existingScrims.findIndex(s => s.id === scrim.id);
        if (existingScrim >= 0) {
            existingScrims[existingScrim] = scrim;
        } else {
            existingScrims.push(scrim);
        }

        this.currentValue.data.LFSScrims = existingScrims;
        this.pub();
    };
}

export const LFSScrims = new LFSScrimsStore();
