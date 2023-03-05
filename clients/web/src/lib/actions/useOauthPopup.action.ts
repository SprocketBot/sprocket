import {browser} from "$app/environment";

/*
      Handle popup logic at the module level to prevent multiple popups from appearing.
   */
let popup: Window;
let _callback: CallableFunction;
function receiveMessage(e: MessageEvent): void {
    if (_callback) {
        _callback(e);
    }
}

if (browser) {
    window.addEventListener(
        "message",
        e => {
            receiveMessage(e);
        },
        false,
    );
}

function openWindow(windowUrl: string, callback: CallableFunction): void {
    if (popup) {
        popup.close();
    }
    // Open as a popup
    const strWindowFeatures = "toolbar=no, menubar=no, width=600, height=700";
    const newWindow = window.open(windowUrl, "SprocketOAuth", strWindowFeatures);
    if (newWindow === null) {
        // Something is wrong?
    } else {
        popup = newWindow;
    }
    _callback = callback;
}

export type OauthPopupArgs = {windowUrl: string; callback: (x: MessageEvent) => unknown};

export function oauthPopup(node: HTMLElement, params?: OauthPopupArgs): void {
    if (!params) throw new Error("Cannot initialize oauth popup without params!");
    node.addEventListener("click", () => {
        openWindow(params.windowUrl, params.callback);
    });
}
