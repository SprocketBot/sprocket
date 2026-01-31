import {gql} from "@urql/core";
import {QueryStore} from "../../core/QueryStore";

import type {Submission} from "./submission.types";

enum EventTopic {
    AllSubmissionEvents = "submission.*",
    SubmissionStarted = "submission.started",
    SubmissionProgress = "submission.progress",
    SubmissionValidating = "submission.validating",

    SubmissionRatifying = "submission.ratifying",
    SubmissionRatificationAdded = "submission.ratification",
    SubmissionRatified = "submission.ratified",

    SubmissionRejectionAdded = "submission.rejection",
    SubmissionRejected = "submission.rejected",

    SubmissionReset = "submission.reset",
}

export interface ActiveSubmissionsStoreValue {
    activeSubmissions: Submission[];
}

export interface ActiveSubmissionsSubscriptionValue {
    activeSubmissions: {
        submission: Submission;
        event: EventTopic;
    };
}

export interface ActiveSubmissionsStoreVariables {}

export interface ActiveSubmissionsSubscriptionVariables {}

// TODO use a LiveQueryStore to have realtime updates. This way will require refresh
export class ActiveSubmissionsStore extends QueryStore<
ActiveSubmissionsStoreValue,
ActiveSubmissionsStoreVariables
> {
    protected queryString = gql<ActiveSubmissionsStoreValue, ActiveSubmissionsStoreVariables>`
    query {
      activeSubmissions: getActiveSubmissions {
        id
        type
        scrimId
        matchId

        creatorId

        status

        taskIds
        items {
          originalFilename
          progress {
            status
            progress {
              value
              message
            }
          }
        }

        validated
        stats {
          games {
            teams {
              won
              score
              players {
                name
                goals
              }
            }
          }
        }
        ratifiers {
          playerId
          franchiseId
          franchiseName
          ratifiedAt
        }
        requiredRatifications
        rejections {
          playerId
          reason
          rejectedAt
        }
      }
    }
  `;

    constructor() {
        super();
        this._vars = {};
    }
}

export const activeSubmissionsStore = new ActiveSubmissionsStore();
