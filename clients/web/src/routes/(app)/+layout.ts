import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { apiUrl } from '../../lib/constants';

export const load: LayoutLoad = async ({ fetch, data }) => {
	const authValid = await fetch(`${apiUrl}/auth/check?token=${data?.authToken ?? ''}`, {
		credentials: 'include'
	}).then((r) => r.json());

	if (!authValid) {
		throw redirect(301, '/login');
	}
};
