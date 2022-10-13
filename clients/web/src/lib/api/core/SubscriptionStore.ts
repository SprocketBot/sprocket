import type {OperationResult, TypedDocumentNode} from "@urql/core";
import type {Readable} from "svelte/store";
import {pipe, subscribe} from "wonka";

import {browser} from "$app/env";

import {client, clientPromise} from "../client";
import {BaseStore} from "./BaseStore";

type SubscriptionValue<
    T,
    V extends Record<string, unknown>,
    HasHistory = false,
> = HasHistory extends true
    ? Array<OperationResult<T, V>>
    : OperationResult<T, V>;

export abstract class SubscriptionStore<
        T,
        V extends Record<string, unknown>,
        HasHistory = false,
    >
    extends BaseStore<SubscriptionValue<T, V, HasHistory>>
    implements Readable<SubscriptionValue<T, V, HasHistory>>
{
    protected gqlUnsub?: () => unknown | undefined;

    protected _vars: V | undefined;

    protected abstract subscriptionString: TypedDocumentNode<T, V>;

    protected abstract handleGqlMessage: (
        message: OperationResult<T, V>,
    ) => void;

    get vars(): V {
        if (!this._vars)
            throw new Error(`Cannot access vars before they are set.`);
        return this._vars;
    }

    set vars(v: V) {
        this._vars = v;
        this.createGqlSubscription();
    }

    subscribe(
        sub: (val: SubscriptionValue<T, V, HasHistory>) => unknown,
    ): () => void {
        if (browser && this.subscribers.size === 0 && this._vars) {
            this.createGqlSubscription();
        }

        return super.subscribe(sub);
    }

    invalidate(): void {
        if (this.gqlUnsub) {
            this.gqlUnsub();
            delete this.gqlUnsub;
        }
        this.createGqlSubscription();
    }

    protected cleanup(
        sub: (val: SubscriptionValue<T, V, HasHistory>) => unknown,
    ): void {
        if (this.subscribers.size === 1 && this.gqlUnsub) {
            this.gqlUnsub();
            delete this.gqlUnsub;
        }
        super.cleanup(sub);
    }

    private createGqlSubscription = (): void => {
        if (this.gqlUnsub || !browser || !this._vars) return;
        clientPromise
            .then(() => {
                const s = pipe(
                    client.subscription(this.subscriptionString, this._vars),
                    subscribe(this.handleGqlMessage),
                );
                this.gqlUnsub = s.unsubscribe;
            })
            .catch(console.error);
    };
}
