import type { TooltipParams } from "./types"
import "./tooltip.postcss"

export const tooltip = (node: HTMLElement, { content, position = "top" }: TooltipParams) => {
    const tooltip = document.createElement("div")
    tooltip.classList.add("tooltip")
    console.log({position})
    
    function updatePosition() {
        const bbox = node.getBoundingClientRect();
        // Position with javascript.
        tooltip.style.top = ""
        tooltip.style.left = ""
        tooltip.style.right = ""
        tooltip.style.bottom = ""
        switch (position) {
            case "top":
                tooltip.style.bottom = `${bbox.top + bbox.height + 4}px`
                tooltip.style.left = `${bbox.left + (bbox.width / 2)}px`
                tooltip.style.transform = "translateX(-50%)"
                break;
            case "bottom":
                tooltip.style.top = `${bbox.top + bbox.height + 4}px`
                tooltip.style.left = `${bbox.left + (bbox.width / 2)}px`
                tooltip.style.transform = "translateX(-50%)"
                break;
            case "left":
                tooltip.style.top = `${bbox.top + (bbox.height / 2)}px`
                tooltip.style.right = `${bbox.left + bbox.width + 4}px`
                tooltip.style.transform = "translateY(-50%)"
                break;
            case "right":
                tooltip.style.top = `${bbox.top + (bbox.height / 2)}px`
                tooltip.style.left = `${bbox.left + bbox.width + 4}px`
                tooltip.style.transform = "translateY(-50%)"
                break;
        }
    }

    tooltip.textContent = content;
    function renderTooltip() {
        // Render tooltip
        updatePosition()
        document.body.appendChild(tooltip)
    }

    function removeTooltip() {
        // Remove tooltip
        document.body.removeChild(tooltip)
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

