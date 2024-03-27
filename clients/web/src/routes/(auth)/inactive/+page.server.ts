import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.authToken) {
		return { authToken: locals.authToken };
	}
};
