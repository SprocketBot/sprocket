import { gql } from '@urql/core';
import { QueryStore } from '../../core/QueryStore';
import type { LeagueScheduleSeason } from './LeagueSchedule.types';

export interface LeagueScheduleVars {}

export interface LeagueScheduleValue {
  seasons: LeagueScheduleSeason[];
}

export class LeagueScheduleStore extends QueryStore<LeagueScheduleValue, LeagueScheduleVars> {
  protected queryString = gql<LeagueScheduleValue, LeagueScheduleVars>`
    fragment FranchiseProfileFields on FranchiseProfile {
      title
      primaryColor
      secondaryColor
      photo {
        url
      }
    }

    query {
      seasons: getScheduleGroups(type: "SEASON") {
        id
        description
        game {
          id
          title
        }
        type {
          name
        }
        childGroups {
          id
          description
          start
          fixtures {
            id
            homeFranchise {
              profile {
                ...FranchiseProfileFields
              }
            }
            awayFranchise {
              profile {
                ...FranchiseProfileFields
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
