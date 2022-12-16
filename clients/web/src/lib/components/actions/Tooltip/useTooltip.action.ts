import type {TooltipParams} from "./types";
import "./tooltip.postcss";

export const tooltip = (node: HTMLElement, {content, position = "top", withArrow, active}: TooltipParams) => {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");

    let _content = content,
        _position = position,
        _withArrow = withArrow,
        _active = active;

    function updatePosition() {
        const bbox = node.getBoundingClientRect();
        // Position with javascript.
        tooltip.style.top = "";
        tooltip.style.left = "";
        tooltip.style.right = "";
        tooltip.style.bottom = "";
        if (_withArrow || typeof _withArrow === "undefined") tooltip.style.setProperty("--arrow", "block");
        else tooltip.style.setProperty("--arrow", "none");
        tooltip.classList.add(_position);
        switch (_position) {
            case "top":
                tooltip.style.bottom = `${bbox.top + bbox.height + 8}px`;
                tooltip.style.left = `${bbox.left + bbox.width / 2}px`;
                tooltip.style.transform = "translateX(-50%)";
                break;
            case "bottom":
                tooltip.style.top = `${bbox.top + bbox.height + 8}px`;
                tooltip.style.left = `${bbox.left + bbox.width / 2}px`;
                tooltip.style.transform = "translateX(-50%)";
                break;
            case "left":
                tooltip.style.top = `${bbox.top + bbox.height / 2}px`;
                tooltip.style.right = `${bbox.left + bbox.width + 8}px`;
                tooltip.style.transform = "translateY(-50%)";
                break;
            case "right":
                tooltip.style.top = `${bbox.top + bbox.height / 2}px`;
                tooltip.style.left = `${bbox.left + bbox.width + 8}px`;
                tooltip.style.transform = "translateY(-50%)";
                break;
        }
    }

    tooltip.textContent = _content;
    function renderTooltip() {
        // Render tooltip
        if (_active) {
            updatePosition();
            document.body.appendChild(tooltip);
        }
    }

    function removeTooltip() {
        // Remove tooltip
        if (document.body.contains(tooltip)) {
            document.body.removeChild(tooltip);

        }
    }
    node.addEventListener("mouseenter", renderTooltip);
    node.addEventListener("mouseleave", removeTooltip);

    return {
        destroy() {
            node.removeEventListener("mouseenter", renderTooltip);
            node.removeEventListener("mouseleave", removeTooltip);
        },
        update({content, position = "top", withArrow, active}: TooltipParams) {
            _content = content;
            _position = position;
            _withArrow = withArrow ?? _withArrow;
            _active = active ?? _active;
        }
    };
};
