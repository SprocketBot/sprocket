import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";

import type {ProgressMessage} from "$lib/utils/types/progress.types";

import {SubscriptionStore} from "../core/SubscriptionStore";

// TODO type parsed replay
export interface FollowReplayParseProgressMessage {
    followReplayParse: ProgressMessage<unknown>;
}

export interface FollowReplayParseProgressVariables {
    submissionId: string;
}

export class FollowReplayParseStore extends SubscriptionStore<
    FollowReplayParseProgressMessage,
    FollowReplayParseProgressVariables,
    true
> {
    protected subscriptionString = gql<
        FollowReplayParseProgressMessage,
        FollowReplayParseProgressVariables
    >`
        subscription ($submissionId: String!) {
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

    constructor(_vars?: FollowReplayParseProgressVariables) {
        super();
        this._vars = _vars;
    }

    protected handleGqlMessage = (
        message: OperationResult<
            FollowReplayParseProgressMessage,
            FollowReplayParseProgressVariables
        >,
    ): void => {
        this.pub([...(this.currentValue ?? []), message]);
    };
}
