import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { apiUrl } from '../../lib/constants';
import { UserSchema } from '@sprocketbot/lib/types';
import { parse } from 'valibot';

export const load: LayoutLoad = async ({ fetch, data }) => {
	const response = await fetch(`${apiUrl}/auth/check?token=${data?.authToken ?? ''}`, {
		credentials: 'include'
	}).catch(() => {
		return { ok: false };
	});

	if (!response.ok || !('json' in response)) {
		// handle core down
		throw redirect(301, '/api-down');
	}

	const authValid = await response.json();

	if (!authValid) {
		throw redirect(301, '/login');
	}

	const result = parse(UserSchema, authValid);

	if (!result.active) {
		throw redirect(301, '/inactive');
	}

	return {
		user: result
	};
};
