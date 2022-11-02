import {gql} from "@urql/core";

export const AllCurrentScrimsQuery = gql`
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
                userId
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
