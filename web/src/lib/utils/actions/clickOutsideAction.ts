const ClickOutsideManager = {
    registeredListeners: new Set<[CallableFunction, HTMLElement]>(),
    boundFunction: undefined,

    handleOnClick: function(event: PointerEvent) {
        this.registeredListeners.forEach(([func, el]) => {
            if (el && !el.contains(event.target) && !event.defaultPrevented) {
                func();
            }
        });
    },
    
    addListener: function(func: CallableFunction, el: HTMLElement) {
        if (this.registeredListeners.size === 0) {
            // Start listening to document clicks
            this.boundFunction = this.handleOnClick.bind(this);
            document.addEventListener("click", this.boundFunction);
        }
        const val = [func, el];
        this.registeredListeners.add(val);
        
        return () => {
            this.registeredListeners.delete(val);
            if (this.registeredListeners.size === 0) {
                // Stop listening to document clicks
                document.removeEventListener("click", this.boundFunction);
            }
        };
    },
};

export const clickOutside = (node: HTMLElement, {callback}: {callback: CallableFunction;}): {destroy: () => void;} => ({
    destroy: ClickOutsideManager.addListener(callback, node),
});
