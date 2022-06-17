const ClickOutsideManager = {
    registeredListeners: new Set<[CallableFunction, HTMLElement]>(),
    boundFunction: undefined,

    handleOnClick: function(event: PointerEvent) {
        this.registeredListeners.forEach(([func, el]) => {
            if (el && !el.contains(event.target) && !event.defaultPrevented) {
                el.dispatchEvent(new CustomEvent("outclick"));
                func();
                console.log("click Handled");

            }
        });
    },

    addListener: function(func: CallableFunction, el: HTMLElement) {
        if (this.registeredListeners.size === 0) {
            // Start listening to document clicks
            this.boundFunction = this.handleOnClick.bind(this);
            document.addEventListener("click", this.boundFunction);
            console.log("addListener Fired");

        }
        // This section never fires
        const val = [func, el];
        console.log(val);
        this.registeredListeners.add(val);
        console.log(this.registeredListeners);

        return () => {
            this.registeredListeners.delete(val);
            if (this.registeredListeners.size === 0) {
                // Stop listening to document clicks
                console.log("Listener Removed");
                document.removeEventListener("click", this.boundFunction);
            }
        };
    },
};

export const clickOutside = (node: HTMLElement, {callback}: {callback: CallableFunction;}): {destroy: () => void;} => ({
    destroy: ClickOutsideManager.addListener(callback, node),
});
