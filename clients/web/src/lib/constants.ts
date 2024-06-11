import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { env as privEnv } from '$env/dynamic/private';
const { PUBLIC_API_URL, PUBLIC_API_SECURE, PUBLIC_API_PORT } = env;
const { INTERNAL_API_URL, INTERNAL_API_PORT } = privEnv;

// Use URL to remove the port if it matches the protocol (e.g. 443 doesn't need to be specified if it's https)
const rawUrl = browser
	? new URL(
	`${PUBLIC_API_SECURE.toLowerCase() === 'true' ? 'https' : 'http'}://${PUBLIC_API_URL}:${PUBLIC_API_PORT}`
	).toString()
	: new URL(`http://${INTERNAL_API_URL ?? PUBLIC_API_URL}:${INTERNAL_API_PORT ?? PUBLIC_API_PORT}`).toString();
// Remove the trailing '/' to make it easier to work with
export const apiUrl = rawUrl.endsWith('/') ? rawUrl.substring(0, rawUrl.length - 1) : rawUrl;
