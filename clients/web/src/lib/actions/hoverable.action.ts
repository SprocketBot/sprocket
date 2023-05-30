export type OnHoverChange = (hovered: boolean) => void

export interface HoveredActionOpts {
    onHoverChange: OnHoverChange
}

export const hoverable = (node: HTMLElement, opts: HoveredActionOpts): { destroy: () => void } => {
    const onMouseEnter = () => opts.onHoverChange(true);
    const onMouseLeave = () => opts.onHoverChange(false);

    node.addEventListener("mouseenter", onMouseEnter);
    node.addEventListener("mouseleave", onMouseLeave);

    return {
        destroy: () => {
            node.removeEventListener("mouseenter", onMouseEnter);
            node.removeEventListener("mouseleave", onMouseLeave);
        },
    };
};
