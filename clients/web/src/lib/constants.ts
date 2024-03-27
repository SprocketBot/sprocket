import { env } from '$env/dynamic/public';
const { PUBLIC_API_URL, PUBLIC_API_SECURE, PUBLIC_API_PORT } = env;

// Use URL to remove the port if it matches the protocol (e.g. 443 doesn't need to be specified if it's https)
const rawUrl = new URL(
	`${PUBLIC_API_SECURE.toLowerCase() === 'true' ? 'https' : 'http'}://${PUBLIC_API_URL}:${PUBLIC_API_PORT}`
).toString();
// Remove the trailing '/' to make it easier to work with
export const apiUrl = rawUrl.endsWith('/') ? rawUrl.substring(0, rawUrl.length - 1) : rawUrl;
