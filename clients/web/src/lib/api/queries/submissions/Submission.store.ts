import {gql, type OperationResult} from "@urql/core";
import {LiveQueryStore} from "../../core/LiveQueryStore";

export interface SubmissionRejection {
    playerId: string;
    playerName: string;
    reason: string;
}
export interface SubmissionProgress {
    progress: {
        value: number;
        message: string;
    };
    status: "Pending" | "Error" | "Complete";
    taskId: string;
    error?: string;
}

export interface Submission {
    status: string;
    creatorId: number;
    ratifications: number;
    requiredRatifications: number;
    userHasRatified: boolean;
    type: "MATCH" | "SCRIM";
    scrimId?: string;
    matchId?: string;
    stale: boolean;
    items: Array<{
        taskId: string;
        originalFilename: string;
        progress: SubmissionProgress;
    }>;
    rejections: SubmissionRejection[];
    validated: boolean;
    stats: {
        games: Array<{
            teams: Array<{
                won: boolean;
                score: number;
                players: Array<{
                    name: string;
                    goals: number;
                }>;
            }>;
        }>;
    };
}

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


export class SubmissionStore extends LiveQueryStore<SubmissionStoreValue, SubmissionStoreVariables, SubmissionSubscriptionValue, SubmissionStoreSubscriptionVariables> {
    protected queryString = gql<SubmissionStoreValue, SubmissionStoreVariables>`
        query ($submissionId: String!) {
            submission: getSubmission(submissionId: $submissionId) {
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

    protected subscriptionString = gql<SubmissionSubscriptionValue, SubmissionStoreSubscriptionVariables>`
        subscription ($submissionId: String!) {
            submission: followSubmission(submissionId: $submissionId) {
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
        this.vars = {submissionId};
        this.subscriptionVariables = {submissionId};
    }

    protected handleGqlMessage = (message: OperationResult<SubmissionSubscriptionValue, SubmissionStoreSubscriptionVariables>): void => {
        if (message.data?.submission) {
            this.currentValue.data = message.data;
        }
        this.pub();
    };
}
