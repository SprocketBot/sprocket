import {gql} from "@urql/core";
import {QueryStore} from "../../core/QueryStore";


export interface FixtureFranchise {
    profile: {
        title: string;
        primaryColor: string;
        secondaryColor: string;
        photo: {url: string;};
    };
}

export interface LeagueFixtureValue {
    homeFranchise: FixtureFranchise;
    awayFranchise: FixtureFranchise;

    scheduleGroup: {description: string;};
    matches: Array<{
        id: number;
        skillGroup: {description: string; ordinal: number;};
        submissionId: string;
        gameMode: {description: string;};
        submissionStatus: "submitting" | "ratifying" | "completed";
    }>;
}

export interface LeagueFixtureVars {
    id: number;
}

export class LeagueFixtureStore extends QueryStore<LeagueFixtureValue, LeagueFixtureVars> {
    protected queryString = gql<LeagueFixtureValue, LeagueFixtureVars>`
        fragment FranchiseFields on Franchise {
            profile {
                title
                primaryColor
                secondaryColor
                photo{
                    url
                }
            }
        }
        
        query($id: Float!) {
            fixture: getFixture(id: $id) {
                homeFranchise { ...FranchiseFields }
                awayFranchise { ...FranchiseFields }
                scheduleGroup { description }
                
                matches {
                    id
                    skillGroup { 
                        ordinal 
                        profile {
                            id
                            description
                        } 
                    }
                    gameMode {
                        description
                    }
                    submissionId
                    submissionStatus
                }
            }
        }
  `;

    constructor(id: number) {
        super();
        this.vars = {id};
    }
}
