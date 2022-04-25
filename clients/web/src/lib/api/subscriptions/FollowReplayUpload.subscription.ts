import type {ProgressMessage} from "$lib/utils/types/progress.types";
import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {SubscriptionStore} from "../core/SubscriptionStore";

// TODO type parsed replay
export interface FollowReplayUploadProgressMessage {
    followReplayParse: ProgressMessage<unknown>;
}

export interface FollowReplayUploadProgressVariables {
    submissionId: string;
}

export class FollowReplayUploadStore extends SubscriptionStore<FollowReplayUploadProgressMessage, FollowReplayUploadProgressVariables, true> {
    protected subscriptionString = gql<FollowReplayUploadProgressMessage, FollowReplayUploadProgressVariables>`
        subscription($submissionId: String!) {
            followReplayParse(submissionId: $submissionId) {
                taskId
                status
                progress {
                    value
                    message
                }
                result {
                    data
                }
                error
            }
        }
    `;

    constructor(_vars?: FollowReplayUploadProgressVariables) {
        super();
        this._vars = _vars;
    }

    protected handleGqlMessage = (message: OperationResult<FollowReplayUploadProgressMessage, FollowReplayUploadProgressVariables>): void => {
        this.pub([...this.currentValue ?? [], message]);
    };
}
