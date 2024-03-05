import type { Handle } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) => {
	event.locals.authToken = event.cookies.get('sprocket-token');

	return resolve(event);
};
