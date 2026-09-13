import {browser} from "$app/env";
import type {OperationResult, TypedDocumentNode} from "@urql/core";
import {gql} from "@urql/core";
import type {Readable} from "svelte/store";
import {pipe, subscribe} from "wonka";
import {client, clientPromise} from "../client";
import {BaseStore} from "./BaseStore";
import {graphqlHttpReachedOrigin} from "./graphqlHttpReachedOrigin";

const HTTP_RETRY_MIN_MS = 1000;
const HTTP_RETRY_MAX_MS = 30000;

const originProbeQuery = gql<{__typename: string;}, Record<string, never>>`
    query GqlOriginProbe {
        __typename
    }
`;

type SubscriptionValue<T, V extends Object, HasHistory = false> = HasHistory extends true
    ? Array<OperationResult<T, V>>
    : OperationResult<T, V>;

export abstract class SubscriptionStore<T, V extends Object, HasHistory = false>
    extends BaseStore<SubscriptionValue<T, V, HasHistory>>
    implements Readable<SubscriptionValue<T, V, HasHistory>> {
    protected gqlUnsub?: () => unknown | undefined;

    protected _vars: V | undefined;

    protected abstract subscriptionString: TypedDocumentNode<T, V>;

    protected abstract handleGqlMessage: (message: OperationResult<T, V>) => void;

    private opening = false;

    private httpRetryTimer?: ReturnType<typeof setTimeout>;

    private httpRetryDelayMs = HTTP_RETRY_MIN_MS;

    get vars(): V {
        if (!this._vars) throw new Error(`Cannot access vars before they are set.`);
        return this._vars;
    }

    set vars(v: V) {
        this._vars = v;
        this.createGqlSubscription();
    }

    subscribe(sub: (val: SubscriptionValue<T, V, HasHistory>) => unknown): () => void {
        if (browser && this.subscribers.size === 0 && this._vars) {
            this.createGqlSubscription();
        }

        return super.subscribe(sub);
    }

    invalidate(): void {
        this.cancelHttpRetry();
        this.closeSubscription();
        this.createGqlSubscription();
    }

    protected cleanup(sub: (val: SubscriptionValue<T, V, HasHistory>) => unknown): void {
        if (this.subscribers.size === 1) {
            this.cancelHttpRetry();
            this.closeSubscription();
        }
        super.cleanup(sub);
    }

    private onOriginDown(): void {
        this.closeSubscription();
        this.scheduleHttpRetry();
    }

    private closeSubscription(): void {
        if (this.gqlUnsub) {
            this.gqlUnsub();
            delete this.gqlUnsub;
        }
    }

    private cancelHttpRetry(): void {
        if (this.httpRetryTimer !== undefined) {
            clearTimeout(this.httpRetryTimer);
            this.httpRetryTimer = undefined;
        }
    }

    private scheduleHttpRetry(): void {
        if (!browser || this.subscribers.size === 0 || this.httpRetryTimer !== undefined) return;

        this.httpRetryTimer = setTimeout(() => {
            this.httpRetryTimer = undefined;
            this.createGqlSubscription();
        }, this.httpRetryDelayMs);
        this.httpRetryDelayMs = Math.min(this.httpRetryDelayMs * 2, HTTP_RETRY_MAX_MS);
    }

    private createGqlSubscription = () => {
        if (this.gqlUnsub || this.opening || !browser || !this._vars) return;
        this.opening = true;
        clientPromise
            .then(async () => {
                const reachedOrigin = await this.probeOrigin();
                if (!reachedOrigin) {
                    this.opening = false;
                    this.onOriginDown();
                    return;
                }
                if (this.gqlUnsub || this.subscribers.size === 0 || !this._vars) {
                    this.opening = false;
                    return;
                }

                this.cancelHttpRetry();
                this.httpRetryDelayMs = HTTP_RETRY_MIN_MS;

                const s = pipe(
                    client.subscription(this.subscriptionString, this._vars),
                    subscribe(message => {
                        if (message.error?.networkError) {
                            this.onOriginDown();
                            return;
                        }
                        this.handleGqlMessage(message);
                    }),
                );
                if (this.subscribers.size === 0) {
                    s.unsubscribe();
                    this.opening = false;
                    return;
                }
                this.gqlUnsub = s.unsubscribe;
                this.opening = false;
            })
            .catch(err => {
                this.opening = false;
                console.error(err);
                this.onOriginDown();
            });
    };

    private async probeOrigin(): Promise<boolean> {
        if (!client) return false;
        try {
            const result = await client
                .query(originProbeQuery, {}, {requestPolicy: "network-only"})
                .toPromise();
            return graphqlHttpReachedOrigin(result);
        } catch {
            return false;
        }
    }
}
