import {writable, derived} from "svelte/store";
import {ToastStatus, type IToast} from "./types";

type ToastInput = Partial<Omit<IToast, "timestamp">> & Pick<IToast, "content">;

const _toasts = writable<IToast[]>([]);

let i = 0;

export const addToast = (t: ToastInput) => {
    const id = i++;
    const newToast: IToast = {
        id: id,
        dismissable: !t.ttl,
        status: ToastStatus.Info,
        ...t,
        timestamp: window.performance.now(),
    };

    _toasts.update(ts => [...ts, newToast]);
    if (t.ttl) {
        setTimeout(() => _toasts.update(ts => ts.filter(_t => _t.id !== id)), t.ttl);
    }
};
export const removeToast = (id: number) => {
    _toasts.update(ts => ts.filter(_t => _t.id !== id));
};

export const toastStore = derived(_toasts, v => v.sort((a, b) => a.id - b.id));
