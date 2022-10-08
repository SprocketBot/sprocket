import type {OperationResult} from "@urql/core";
import {gql} from "@urql/core";

import {LiveQueryStore} from "../../core/LiveQueryStore";

export interface MetricsResult {
    metrics: {
        pendingScrims: number;
        playersQueued: number;
        playersScrimming: number;
        totalScrims: number;
        totalPlayers: number;
        completedScrims: number;
        previousCompletedScrims: number;
    };
}

interface MetricsVariables {
    [key: string]: never
}

class ScrimMetricsStore extends LiveQueryStore<MetricsResult, MetricsVariables> {
    protected queryString = gql<MetricsResult>`
    query {
        metrics: getScrimMetrics{
            pendingScrims
            playersQueued
            playersScrimming
            totalScrims
            totalPlayers
            completedScrims(period:HOUR)
            previousCompletedScrims(period:HOUR)
        }
    }
    `;

    protected subscriptionString = gql<MetricsResult>`
    subscription {
        metrics: followScrimMetrics{
            pendingScrims
            playersQueued
            playersScrimming
            totalScrims
            totalPlayers
            completedScrims(period: HOUR)
            previousCompletedScrims(period: HOUR)
        }
    }`;

    protected _subVars = {};


    constructor() {
        super();
        this._vars = {};
        this.subscriptionVariables = {};
    }

    protected handleGqlMessage = (message: OperationResult<MetricsResult>): void => {
        if (!message.data)  {
            console.warn(`Recieved erroneous message from followScrimMetrics: ${message.error}`);
            return;
        }
        if (!this.currentValue.data) {
            console.warn(`Recieved subscription before querying finished!`);
            return;
        }
        this.currentValue.data = message.data;
        this.pub();
    };
}

export const scrimMetrics = new ScrimMetricsStore();
