export type TooltipPosition = "top" | "bottom" | "left" | "right";
export type TooltipParams = {
    position?: TooltipPosition;
    content: string;
    withArrow?: boolean;
    active?: boolean
};
