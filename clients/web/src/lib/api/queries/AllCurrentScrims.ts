import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";

export class AllCurrentScrims {
    protected queryString = gql`
    query {
        allCurrentScrims: getAllScrims {
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

}