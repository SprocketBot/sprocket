import type {Writable} from "svelte/store";

export type SidebarWidth = "full" | "md" | "sm";

export const InternalSidebarContextKey = "INTERNAL_SIDEBAR_CONTEXT_KEY";
export type InternalSidebarContext = Writable<{
    iconOnly?: boolean;
    showTooltips?: boolean;
}>;
