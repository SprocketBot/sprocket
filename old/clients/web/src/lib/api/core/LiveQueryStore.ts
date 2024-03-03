import {browser} from "$app/env";
import type {OperationResult, TypedDocumentNode} from "@urql/core";
import {subscribe, pipe} from "wonka";
import {client, clientPromise} from "../client";
import {QueryStore} from "./QueryStore";

export abstract class LiveQueryStore<T, V extends Object, ST = T, SV extends Object = {}> extends QueryStore<T, V> {
    protected gqlUnsub?: () => unknown;

    protected abstract  _subVars: SV;

    protected abstract subscriptionString: TypedDocumentNode<ST, SV>;

    protected abstract handleGqlMessage: (message: OperationResult<ST>) => void;

    get subscriptionVariables(): SV {
        return this._subVars;
    }

    set subscriptionVariables(v: SV) {
        this._subVars = v;
        if (this.subscribers.size > 0) this.createGqlSubscription();
    }

    subscribe(sub: (T: OperationResult<T, V>) => unknown): () => void {
        if (browser && this.subscribers.size === 0 && this._subVars) {
            this.createGqlSubscription();
        }

        return super.subscribe(sub);
    }

    invalidate(): void {
        if (this.gqlUnsub) {
            this.gqlUnsub();
            delete this.gqlUnsub;
            if (this.subscribers.size > 0) {
                this.createGqlSubscription();
            }
        }
        super.invalidate();
    }

    protected cleanup(sub: (T: OperationResult<T, V>) => unknown): void {
        if (this.subscribers.size === 1 && this.gqlUnsub) {
            this.gqlUnsub();
            delete this.gqlUnsub;
        }
        super.cleanup(sub);
    }

    private createGqlSubscription = () => {
        if (this.gqlUnsub || !browser || !this._subVars) return;
        clientPromise.then(() => {
            const s = pipe(
                client.subscription(this.subscriptionString, this._subVars),
                subscribe(this.handleGqlMessage),
            );
            this.gqlUnsub = s.unsubscribe;
        }).catch(console.error);

    };

}
