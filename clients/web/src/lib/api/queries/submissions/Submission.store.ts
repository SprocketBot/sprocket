import { gql, type OperationResult } from '@urql/core';
import { LiveQueryStore } from '../../core/LiveQueryStore';
import type { Submission } from './submission.types';

export interface SubmissionStoreValue {
  submission: Submission;
}
export interface SubmissionSubscriptionValue {
  submission: Submission;
}
export interface SubmissionStoreVariables {
  submissionId: string;
}
export interface SubmissionStoreSubscriptionVariables {
  submissionId: string;
}

export class SubmissionStore extends LiveQueryStore<
  SubmissionStoreValue,
  SubmissionStoreVariables,
  SubmissionSubscriptionValue,
  SubmissionStoreSubscriptionVariables
> {
  protected _subVars: SubmissionStoreSubscriptionVariables;

  protected queryString = gql<SubmissionStoreValue, SubmissionStoreVariables>`
    query ($submissionId: String!) {
      submission: getSubmission(submissionId: $submissionId) {
        id
        creatorId
        ratifications
        requiredRatifications
        userHasRatified
        type
        scrimId
        matchId
        status
        items {
          taskId
          originalFilename
          progress {
            progress {
              value
              message
            }
            status
            taskId
            error
          }
        }
        rejections {
          playerName
          reason
          stale
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
      }
    }
  `;

  protected subscriptionString = gql<
    SubmissionSubscriptionValue,
    SubmissionStoreSubscriptionVariables
  >`
    subscription ($submissionId: String!) {
      submission: followSubmission(submissionId: $submissionId) {
        id
        creatorId
        ratifications
        requiredRatifications
        userHasRatified
        type
        scrimId
        matchId
        status
        items {
          taskId
          originalFilename
          progress {
            progress {
              value
              message
            }
            status
            taskId
            error
          }
        }
        rejections {
          playerName
          reason
          stale
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
      }
    }
  `;

  constructor(submissionId: string) {
    super();
    this.vars = { submissionId };
    this.subscriptionVariables = { submissionId };
    this._subVars = { submissionId };
  }

  protected handleGqlMessage = (
    message: OperationResult<SubmissionSubscriptionValue, SubmissionStoreSubscriptionVariables>,
  ): void => {
    if (message.data?.submission) {
      this.currentValue.data = message.data;
    }
    this.pub();
  };
}
