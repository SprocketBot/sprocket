import {gql} from "@urql/core";
import {QueryStore} from "../../core/QueryStore";

export interface LeagueScheduleValue {
    schedule: {
        id: number;
        description: string;
        game: {
            id: number;
            title: string;
        };
        type: {
            name: string;
        };
        childGroups: Array<{
            id: number;
            description: string;
            fixtures: Array<{
                id: number;
                matches: Array<{
                    skillGroup: {
                        code: string;
                        description: string;
                    };
                    submissionId: string;
                }>;
                homeFranchise: {
                    profile: {
                        title: string;
                    };
                };
                awayFranchise: {
                    profile: {
                        title: string;
                    };
                };
            }>;
        }>;
    };
}

export interface LeagueScheduleVars {
}

export class LeagueScheduleStore extends QueryStore<LeagueScheduleValue, LeagueScheduleVars> {
    protected queryString = gql<LeagueScheduleValue, LeagueScheduleVars>`
      query {
          schedule: getScheduleGroups(type:"SEASON") {
              id
              description
              game {
                  id
                  title
              }
              type {
                  name
              }
              childGroups{
                  id
                  description
                  fixtures {
                      id
                      matches {
                          skillGroup {
                              code
                              description
                          }
                          submissionId
                      }
                      homeFranchise{
                          profile {
                              title
                          }
                      }
                      awayFranchise{
                          profile {
                              title
                          }
                      }
                  }
              }
          }
      }
  `;

    constructor() {
        super();
        this.vars = {};
    }
}
