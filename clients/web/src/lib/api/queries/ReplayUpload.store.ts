import {gql, type OperationResult} from "@urql/core";
import {readable, type Readable} from "svelte/store";
import {LiveQueryStore} from "../core/LiveQueryStore";

export interface ReplayUploadMessage {
    progress: Array<{
        taskId: string;
        status: string;
        progress: {
            value: number;
            message: string;
        };
        error: string;
    }>;
}

export interface ReplayUploadVariables {
    submissionId: string;
}


class ReplayUploadStore extends LiveQueryStore<ReplayUploadMessage, ReplayUploadVariables, ReplayUploadMessage, ReplayUploadVariables> {
    protected queryString = gql`
        query($submissionId: String!) {
            progress: getReplayParseProgress(submissionId: $submissionId) {
                taskId
                status
                filename
                progress {
                    value
                    message
                }
                error
            }
        }
    `;

    protected subscriptionString = gql`
        subscription($submissionId: String!) {
            progress: followReplayParse(submissionId: $submissionId) {
                taskId
                status
                filename
                progress {
                    value
                    message
                }
                error
            }
        }
    `;

    constructor(submissionId: string) {
        super();
        this.vars = {submissionId};
        this._subVars = {submissionId};
    }

    protected handleGqlMessage = (m: OperationResult<ReplayUploadMessage>): void => {
        if (m.data?.progress) {
            this.currentValue.data = m.data;
            this.pub();
        }
    };
}


export function getReplayUploadStore(submissionId: string): Readable<Record<string, ReplayUploadMessage["progress"]>> {
    const baseStore = new ReplayUploadStore(submissionId);
    const output = readable({}, set => {
        const value: Record<string, ReplayUploadMessage["progress"][number]> = {};
        set(value);

        const unsub = baseStore.subscribe(v => {
            if (!v.data?.progress) return;
            v.data.progress.forEach(p => {
                value[p.taskId] = p;
            });

            set(value);
        });

        return unsub;
    });
    return output;
}
