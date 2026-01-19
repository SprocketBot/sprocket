import { gql } from '@urql/core';
import { QueryStore } from '../../core/QueryStore';

export interface Match {
  id: number;
  rounds: Array<{
    id: number;
  }>;
  skillGroup: {
    profile: {
      description: string;
    };
  };
  gameMode: {
    description: string;
  };
  matchParent: {
    fixture: {
      scheduleGroup: {
        description: string;
      };
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
    };
  };
}

export interface MatchResult {
  getMatchBySubmissionId: Match;
}

export interface MatchVars {
  submissionId: string;
}

export class MatchStore extends QueryStore<MatchResult, MatchVars> {
  protected queryString = gql<MatchResult, MatchVars>`
    query ($submissionId: String!) {
      getMatchBySubmissionId(submissionId: $submissionId) {
        id
        rounds {
          id
        }
        skillGroup {
          profile {
            description
          }
        }
        gameMode {
          description
        }
        matchParent {
          id
          fixture {
            scheduleGroup {
              description
            }
            homeFranchise {
              profile {
                title
              }
            }
            awayFranchise {
              profile {
                title
              }
            }
          }
        }
      }
    }
  `;

  constructor(submissionId: string) {
    super();
    this.vars = { submissionId };
  }
}
