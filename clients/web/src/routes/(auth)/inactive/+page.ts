import { redirect } from '@sveltejs/kit';
import { apiUrl } from '../../../lib/constants';
import type { PageLoad } from './$houdini';
import { load_CurrentUser } from '../../../../$houdini';
import type { User } from '@sprocketbot/lib/types';

export const load: PageLoad = async (event) => {
	const { fetch, data } = event;
	const authValid: false | User = await fetch(`${apiUrl}/auth/check`, {
		headers: data?.authToken ? { Cookie: `sprocket-token=${data.authToken}` } : {},
		credentials: 'include'
	})
		.then((r) => r.json())
		.catch((e) => console.log(e));

	if (!authValid) {
		throw redirect(301, '/login');
	}

	if (authValid.active) throw redirect(301, '/');

	return {
		...(await load_CurrentUser({ event }))
	};
};
