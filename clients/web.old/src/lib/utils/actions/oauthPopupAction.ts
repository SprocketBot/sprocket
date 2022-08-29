import {browser} from "$app/env";

/*
      Handle popup logic at the module level to prevent multiple popups from appearing.
   */
let popup: Window;
let _callback: CallableFunction;
function receiveMessage(e: MessageEvent) {
    if (_callback) {
        _callback(e);
    }
}

if (browser) {
    window.addEventListener("message", e => { receiveMessage(e) }, false);
}

function openWindow(windowUrl: string, callback: CallableFunction) {
    if (popup) {
        popup.close();
    }
    // Open as a popup
    const strWindowFeatures = "toolbar=no, menubar=no, width=600, height=700";
    popup = window.open(windowUrl, "SprocketOAuth", strWindowFeatures);
    _callback = callback;
}

export function oauthPopup(node: HTMLElement, params: {windowUrl: string; callback: (x: MessageEvent) => unknown;}): void {
    node.addEventListener("click", () => {
        openWindow(params.windowUrl, params.callback);
    });
}
