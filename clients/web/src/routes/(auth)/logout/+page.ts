import { redirect } from '@sveltejs/kit';
import { apiUrl } from '../../../lib/constants';

export const load = () => {
	throw redirect(301, `${apiUrl}/auth/logout`);
};
