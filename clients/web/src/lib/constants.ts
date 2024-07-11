import { env } from '$env/dynamic/public';
const { PUBLIC_API_URL, PUBLIC_API_SECURE, PUBLIC_API_PORT } = env;

if (!PUBLIC_API_SECURE || !PUBLIC_API_URL || !PUBLIC_API_PORT) 
	throw new Error("Missing required environment variables")

let rawUrl
if (typeof window === "undefined") {
    const { PRIVATE_API_URL, PRIVATE_API_SECURE, PRIVATE_API_PORT } = process.env;
    if (!PRIVATE_API_SECURE || !PRIVATE_API_URL || !PRIVATE_API_PORT)
        throw new Error("Missing required environment variables")

    // we are in server land
    rawUrl = new URL(
        `${PRIVATE_API_SECURE.toLowerCase() === 'true' ? 'https' : 'http'}://${PRIVATE_API_URL}:${PRIVATE_API_PORT ?? 443}`
    ).toString();
} else {
    // we are in browser land
    rawUrl = new URL(
        `${PUBLIC_API_SECURE.toLowerCase() === 'true' ? 'https' : 'http'}://${PUBLIC_API_URL}:${PUBLIC_API_PORT ?? 443}`
    ).toString();
}

// Use URL to remove the port if it matches the protocol (e.g. 443 doesn't need to be specified if it's https)
// Remove the trailing '/' to make it easier to work with
export const apiUrl = rawUrl.endsWith('/') ? rawUrl.substring(0, rawUrl.length - 1) : rawUrl;