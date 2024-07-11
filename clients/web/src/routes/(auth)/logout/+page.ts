import { redirect } from '@sveltejs/kit';
import { publicApiUrl } from '../../../lib/constants';

export const load = () => {
	throw redirect(301, `${publicApiUrl}/auth/logout`);
};
