import type { Writable } from "svelte/store";

export type SidebarWidth = "full" | "md" | "sm";

export const SidebarContextKey = "SIDEBAR_CONTEXT_KEY";
export type SidebarContext = Writable<{
    iconOnly?: boolean;
    showTooltips?: boolean;
}>;
