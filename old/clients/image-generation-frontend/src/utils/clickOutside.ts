/** Dispatch event on click outside of node */
export interface clickOutsideOptions {
    callback: CallableFunction;
}

export default function clickOutside(node: HTMLElement, {callback}: clickOutsideOptions): {destroy: () => void;} {
    const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            callback();
        }
    };

    document.addEventListener("click", handleClick, true);
  
    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        },
    };
}
