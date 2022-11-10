import type { TooltipParams } from "./types"
import "./tooltip.postcss"

export const tooltip = (node: HTMLElement, { content, position = "top" }: TooltipParams) => {
    const tooltip = document.createElement("div")
    tooltip.classList.add("tooltip")

    function updatePosition() {
        // Position with javascript.
        switch (position) {
            case "top":
                break;
            case "bottom":
                break;
            case "left":
                break;
            case "right":
                break;
        }
    }

    tooltip.textContent = content;
    function renderTooltip() {
        // Render tooltip
        updatePosition()
        node.parentElement?.insertBefore(tooltip, node)
    }

    function removeTooltip() {
        // Remove tooltip
        node.parentElement?.removeChild(tooltip)
    }
    node.addEventListener("mouseenter", renderTooltip)
    node.addEventListener("mouseleave", removeTooltip)

    return {
        destroy() {
            node.removeEventListener("mouseenter", renderTooltip)
            node.removeEventListener("mouseleave", removeTooltip)
        }
    }
}