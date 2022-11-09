import { writable, derived } from "svelte/store"
import { ToastStatus, type IToast } from "./types"


type ToastInput = Partial<IToast> & Pick<IToast, "content">

const _toasts = writable<IToast[]>([])

let i = 0;

export const addToast = (t: ToastInput) => {
    const id = i++;
    const newToast = {
        id: id,
        dismissable: !t.ttl ,
        status: ToastStatus.Info,
        ...t, 
    }


    _toasts.update(ts => [...ts,newToast])
    if (t.ttl) {
        setTimeout(() => _toasts.update(ts => ts.filter(_t => _t.id !== id)), t.ttl)
    }
}
export const removeToast = (id: number) => {
    _toasts.update(ts => ts.filter(_t => _t.id !== id))
}

export const toastStore = derived(_toasts, v => v.sort((a, b) => a.id - b.id))