import type {OperationResult, TypedDocumentNode} from "@urql/core";
import {client, clientPromise} from "../client";
import {BaseStore} from "./BaseStore";
import type {Readable} from "svelte/store";

export abstract class QueryStore<T, V extends Object> extends BaseStore<OperationResult<T, V>> implements Readable<OperationResult<T, V>> {
    protected _vars: V | undefined;

    protected currentValue: OperationResult<T, V> = {
        fetching: true,
    } as unknown as OperationResult<T, V>;

    protected abstract queryString: TypedDocumentNode<T, V>;

    set vars(newVars: V) {
        this._vars = newVars;
        this.query.bind(this)().catch(e => {
            throw e;
        });
    }

    subscribe(sub: (T: OperationResult<T, V>) => unknown): () => void {
        if (this.subscribers.size === 0) {
            if (typeof this._vars !== "undefined") {
                this.query.bind(this)().catch(e => {
                    console.warn(e);
                });
            }
        }
        if (this.currentValue) sub(this.currentValue);

        return super.subscribe(sub);
    }

    set(v: V): void {
        this.vars = v;
    }

    invalidate(): void {
        this.query.bind(this)().catch(console.error);
    }

    protected async query(): Promise<void> {
        if (!client) {
            await clientPromise;
        }
        const result = await client.query(this.queryString, this._vars, {
            requestPolicy: "cache-and-network",
        }).toPromise();
        this.pub(result);
    }
}
