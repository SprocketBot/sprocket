import { PUBLIC_API_URL, PUBLIC_API_SECURE, PUBLIC_API_PORT } from '$env/static/public';
export const apiUrl = `${PUBLIC_API_SECURE.toLowerCase() === 'true' ? 'https' : 'http'}://${PUBLIC_API_URL}:${PUBLIC_API_PORT}`;
