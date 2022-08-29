import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";
import {LiveQueryStore} from "../../core/LiveQueryStore";

interface ScrimsDisabledData {
    getScrimsDisabled: boolean;
}

class ScrimsDisabledStore extends LiveQueryStore<ScrimsDisabledData, {}, ScrimsDisabledData> {
    protected queryString = gql<ScrimsDisabledData, {}>`
    query {
        getScrimsDisabled
    }`;

    protected subscriptionString = gql<ScrimsDisabledData, {}>`
        subscription {
            getScrimsDisabled: followScrimsDisabled
        }
    `;

    constructor() {
        super();
        // No variables needed
        this._vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<ScrimsDisabledData>) => {
        if (!message.data) {
            console.warn(`Recieved erroneous message from followScrimsDisabled: ${message.error}`);
            return;
        }
        if (!this.currentValue.data) {
            console.warn(`Recieved subscription before query completed!`);
            return;
        }

        this.currentValue.data.getScrimsDisabled = message.data?.getScrimsDisabled;
        this.pub();
    };
}

export const scrimsDisabled = new ScrimsDisabledStore();
