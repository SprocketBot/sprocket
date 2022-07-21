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
    }>;
}

export interface LeagueFixtureVars {
    id: number;
}

export class LeagueFixtureStore extends QueryStore<LeagueFixtureValue, LeagueFixtureVars> {
    protected queryString = gql<LeagueFixtureValue, LeagueFixtureVars>`
        query($id: Float!) {
            fixture: getFixture(id: $id) {
                homeFranchise { profile { title, primaryColor, secondaryColor, photo { url } } }
                awayFranchise { profile { title, primaryColor, secondaryColor, photo { url } } }
                scheduleGroup { description }
                
                matches {
                    id
                    skillGroup { description, ordinal 
                        profile {
                            id
                        } 
                    }
                    submissionId
                }
            }
        }
  `;

    constructor(id: number) {
        super();
        this.vars = {id};
    }
}
