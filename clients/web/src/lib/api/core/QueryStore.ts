import type {OperationResult, TypedDocumentNode} from "@urql/core";
import type {Readable} from "svelte/store";

import {browser} from "$app/env";

import {client, clientPromise} from "../client";
import {BaseStore} from "./BaseStore";

export abstract class QueryStore<T, V extends Record<string, unknown>>
    extends BaseStore<OperationResult<T, V>>
    implements Readable<OperationResult<T, V>>
{
    protected _vars: V | undefined;

    protected currentValue: OperationResult<T, V> = {
        fetching: true,
    } as unknown as OperationResult<T, V>;

    protected abstract queryString: TypedDocumentNode<T, V>;

    set vars(newVars: V) {
        this._vars = newVars;
        this.query
            .bind(this)()
            .catch(e => {
                throw e;
            });
    }

    subscribe(sub: (T: OperationResult<T, V>) => unknown): () => void {
        if (this.currentValue) sub(this.currentValue);
        if (this.subscribers.size === 0) {
            if (typeof this._vars !== "undefined") {
                this.query
                    .bind(this)()
                    .catch(e => {
                        console.warn(e);
                    });
            }
        }

        return super.subscribe(sub);
    }

    set(v: V): void {
        this.vars = v;
    }

    invalidate(): void {
        if (!browser) return;
        this.query.bind(this)().catch(console.error);
    }

    protected async query(): Promise<void> {
        if (!browser) return;
        if (!client) {
            await clientPromise;
        }
        const result = await client
            .query(this.queryString, this._vars, {
                requestPolicy: "cache-and-network",
            })
            .toPromise();
        this.pub(result);
    }
}
