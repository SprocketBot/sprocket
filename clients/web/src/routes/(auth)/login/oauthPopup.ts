import { browser } from '$app/environment';
import type { Action } from 'svelte/action';

let popup: Window;
let _callback: (e: MessageEvent) => unknown;
function recieveMessage(e: MessageEvent) {
	if (_callback) _callback(e);
}

if (browser)
	window.addEventListener(
		'message',
		(e) => {
			recieveMessage(e);
		},
		false
	);
function openWindow(windowUrl: string, callback: (e: MessageEvent) => unknown) {
	if (popup) popup.close();
	const strWindowFeatures = 'toolbar=no, menubar=no, width=600, height=700';
	popup = window.open(windowUrl, 'SprocketOAuth', strWindowFeatures)!;
	_callback = callback;
	popup.addEventListener('message', _callback);
	popup.addEventListener(
		'close',
		() => {
			popup.removeEventListener('message', _callback);
		},
		{ once: true }
	);
}

export const oauthPopup: Action<
	HTMLElement,
	{ windowUrl: string; callback: (e: MessageEvent) => unknown }
> = (node: HTMLElement, params: { windowUrl: string; callback: (e: MessageEvent) => unknown }) => {
	const func = () => openWindow(params.windowUrl, params.callback);

	node.addEventListener('click', func);
	return {
		destroy() {
			node.removeEventListener('click', func);
		}
	};
};
