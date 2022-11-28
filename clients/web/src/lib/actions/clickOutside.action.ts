const ClickOutsideManager = {
    registeredListeners: new Set<[CallableFunction, HTMLElement]>(),
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    boundFunction: (e: MouseEvent) => {},

    handleOnClick: function (event: MouseEvent) {
        this.registeredListeners.forEach(([func, el]) => {
            if (el && !el.contains(event.target as Node) && !event.defaultPrevented) {
                func();
            }
        });
    },

    addListener: function (func: CallableFunction, el: HTMLElement) {
        if (this.registeredListeners.size === 0) {
            // Start listening to document clicks
            this.boundFunction = this.handleOnClick.bind(this);
            document.addEventListener("click", this.boundFunction, {
                capture: true,
            });
        }
        const val: [CallableFunction, HTMLElement] = [func, el];
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

export const clickOutside = (node: HTMLElement, {callback}: {callback: CallableFunction}): {destroy: () => void} => ({
    destroy: ClickOutsideManager.addListener(callback, node),
});
