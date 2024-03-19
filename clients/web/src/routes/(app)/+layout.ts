import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { apiUrl } from '../../lib/constants';
import { UserSchema } from '@sprocketbot/lib/types';
import { parse } from 'valibot';

export const load: LayoutLoad = async ({ fetch, data }) => {
	const authValid: unknown = await fetch(`${apiUrl}/auth/check?token=${data?.authToken ?? ''}`, {
		credentials: 'include'
	})
		.then((r) => r.json())
		.catch((e) => console.log(e));

	if (!authValid) {
		throw redirect(301, '/login');
	}

	const result = parse(UserSchema, authValid)

	if (!result.active) {
		throw redirect(301, '/inactive')
	}

	return {
		user: result
	};
};
