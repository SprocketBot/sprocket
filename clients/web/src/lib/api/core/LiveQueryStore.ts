import {browser} from "$app/env";
import type {OperationResult, TypedDocumentNode} from "@urql/core";
import {subscribe, pipe} from "wonka";
import {client, clientPromise} from "../client";
import {graphqlHttpReachedOrigin} from "./graphqlHttpReachedOrigin";
import {QueryStore} from "./QueryStore";

const HTTP_RETRY_MIN_MS = 1000;
const HTTP_RETRY_MAX_MS = 30000;

export abstract class LiveQueryStore<
    T,
    V extends Object,
    ST = T,
    SV extends Object = {},
> extends QueryStore<T, V> {
    protected gqlUnsub?: () => unknown;

    protected abstract _subVars: SV;

    protected abstract subscriptionString: TypedDocumentNode<ST, SV>;

    protected abstract handleGqlMessage: (message: OperationResult<ST>) => void;

    private opening = false;

    private httpRetryTimer?: ReturnType<typeof setTimeout>;

    private httpRetryDelayMs = HTTP_RETRY_MIN_MS;

    get subscriptionVariables(): SV {
        return this._subVars;
    }

    set subscriptionVariables(v: SV) {
        this._subVars = v;
        if (this.gqlUnsub) {
            this.closeSubscription();
            if (this.subscribers.size > 0 && graphqlHttpReachedOrigin(this.currentValue)) {
                this.createGqlSubscription();
            }
        }
    }

    invalidate(): void {
        this.cancelHttpRetry();
        this.closeSubscription();
        super.invalidate();
    }

    protected async query(): Promise<void> {
        try {
            await super.query();
        } catch {
            this.onOriginDown();
            return;
        }

        if (!browser) return;

        if (!graphqlHttpReachedOrigin(this.currentValue)) {
            this.onOriginDown();
            return;
        }

        this.cancelHttpRetry();
        this.httpRetryDelayMs = HTTP_RETRY_MIN_MS;
        if (this.subscribers.size > 0 && this._subVars) {
            this.createGqlSubscription();
        }
    }

    protected cleanup(sub: (T: OperationResult<T, V>) => unknown): void {
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
            this.query().catch(() => undefined);
        }, this.httpRetryDelayMs);
        this.httpRetryDelayMs = Math.min(this.httpRetryDelayMs * 2, HTTP_RETRY_MAX_MS);
    }

    private createGqlSubscription = () => {
        if (this.gqlUnsub || this.opening || !browser || !this._subVars) return;
        this.opening = true;
        clientPromise
            .then(() => {
                if (this.gqlUnsub || this.subscribers.size === 0 || !this._subVars) {
                    this.opening = false;
                    return;
                }
                const s = pipe(
                    client.subscription(this.subscriptionString, this._subVars),
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
}
