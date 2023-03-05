import type {Action} from "svelte/action";

export type ButtonVariant = "default" | "alt" | "dark" | "light" | "success" | "danger" | "warning";
export type ButtonSize = "default" | "xs" | "sm" | "lg" | "xl";
// export type ProgressBarSize = "sm" | "md" | "lg" | "xl";
// export type ProgressLocation = "hidden" | "inside" | "outside";
export type ButtonActionTuple<T> = [Action<HTMLElement, T>, T];
