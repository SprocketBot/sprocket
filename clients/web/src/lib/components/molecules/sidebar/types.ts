export type SidebarWidth = "full" | "md" | "sm";

export const SidebarContextKey = "SIDEBAR_CONTEXT_KEY";
export type SidebarContext = {
    iconOnly?: boolean;
    showTooltips?: boolean;
};
