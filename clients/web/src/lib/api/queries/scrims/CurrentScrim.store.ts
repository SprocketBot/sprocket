import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";

import {toasts} from "../../../components";
import {screamingSnakeToHuman} from "../../../utils";
import {LiveQueryStore} from "../../core/LiveQueryStore";

export interface CurrentScrim {
    id: string;
    playerCount: number;
    maxPlayers: number;
    status: string;
    createdAt: Date;
    skillGroup: {
        profile: {
            description: string;
        };
    };
    currentGroup?: {
        code: string;
        players: string[];
    };
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
    players: Array<{
        id: number;
        name: string;
        checkedIn: boolean;
    }>;
    playersAdmin: Array<{
        id: number;
        name: string;
    }>;
    lobby: {
        name: string;
        password: string;
    };

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
    [key: string]: never;
}

export interface CurrentScrimStoreSubscriptionVariables {
    [key: string]: never;
}

class CurrentScrimStore extends LiveQueryStore<
    CurrentScrimStoreValue,
    CurrentScrimStoreVariables,
    CurrentScrimSubscriptionValue,
    CurrentScrimStoreSubscriptionVariables
> {
    protected queryString = gql<
        CurrentScrimStoreValue,
        CurrentScrimStoreVariables
    >`
    query {
        currentScrim: getCurrentScrim {
            id
            playerCount
            maxPlayers
            status
            createdAt
            skillGroup {
                profile {
                    description
                }
            }
            currentGroup {
                code
                players
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
            lobby {
                name
                password
            }
            games {
                teams {
                    players {
                        id
                        name
                    }
                }
            }
            
        }
    }`;

    protected subscriptionString = gql<CurrentScrimSubscriptionValue, CurrentScrimStoreSubscriptionVariables>`
    subscription {
        currentScrim: followCurrentScrim {
            scrim {
                id
                submissionId
                playerCount
                maxPlayers
                status
                createdAt
                skillGroup {
                    profile {
                        description
                    }
                }
                currentGroup {
                    code
                    players
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
                lobby {
                    name
                    password
                }
                games {
                    teams {
                        players {
                            id
                            name
                        }
                    }
                }
            }
            submissionId
        }
    `;

    protected subscriptionString = gql<
        CurrentScrimSubscriptionValue,
        CurrentScrimStoreSubscriptionVariables
    >`
        subscription {
            currentScrim: followCurrentScrim {
                scrim {
                    id
                    playerCount
                    maxPlayers
                    status
                    skillGroup {
                        profile {
                            description
                        }
                    }
                    currentGroup {
                        code
                        players
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
                    lobby {
                        name
                        password
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

    protected handleGqlMessage = (
        message: OperationResult<
            CurrentScrimSubscriptionValue,
            CurrentScrimStoreSubscriptionVariables
        >,
    ): void => {
        if (message?.data?.currentScrim) {
            const {scrim} = message?.data?.currentScrim ?? {};
            if (scrim?.status === "CANCELLED" || scrim?.status === "COMPLETE") {
                this.currentValue.data = undefined;
                toasts.pushToast({
                    status: "info",
                    content: `Scrim ${screamingSnakeToHuman(scrim.status)}`,
                });
            } else if (!this.currentValue.data)
                this.currentValue.data = {currentScrim: scrim};
            else this.currentValue.data.currentScrim = scrim;

            this.pub();
        }
    };
}

export const currentScrim = new CurrentScrimStore();
