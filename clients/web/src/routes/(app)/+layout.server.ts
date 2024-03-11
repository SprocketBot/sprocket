import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	if (locals.authToken) {
		return { authToken: locals.authToken };
	}
};
