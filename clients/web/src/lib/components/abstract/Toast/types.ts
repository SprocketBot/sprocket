import type { IconSource } from "@steeze-ui/svelte-icon/types";

export enum ToastStatus {
    Info = "info",
    Success = "success",
    Warning = "warning",
    Danger = "danger"
}

export type IToast = {
    id: number;
    content: string;
    status: ToastStatus;
    ttl?: number;
    dismissable?: boolean;
    icon?: IconSource;
}