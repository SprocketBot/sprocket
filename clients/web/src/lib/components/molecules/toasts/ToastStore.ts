import type {Readable} from "svelte/store";

import {BaseStore} from "$lib/api/core/BaseStore";

export interface Toast {
    content: string;
    status: "info" | "error";
    id?: string;
}

class ToastStore extends BaseStore<Toast[]> implements Readable<Toast[]> {
    currentValue: Toast[] = [];

    pushToast(t: Toast): void {
        if (!t.id) {
            t.id = Math.random().toString()
                .split(".")[1];
        }

        this.pub([...this.currentValue, t]);
    }

    remove(tid: string): void {
        this.pub(this.currentValue.filter(t => t.id !== tid));
    }
}
export const toasts = new ToastStore();
