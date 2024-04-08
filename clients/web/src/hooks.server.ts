import type { Handle } from '@sveltejs/kit';
import { setSession } from '$houdini';

export const handle: Handle = ({ event, resolve }) => {
	event.locals.authToken = event.cookies.get('sprocket-token');

	if (event.locals.authToken)
		setSession(event, { token: event.locals.authToken });

	return resolve(event);
};
