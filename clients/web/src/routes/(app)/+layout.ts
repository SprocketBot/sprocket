import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { apiUrl } from '../../lib/constants';
import { UserSchema } from '@sprocketbot/lib/types';
import { parse } from 'valibot';

export const load: LayoutLoad = async ({ fetch, data }) => {
	const headers: Record<string, string> = {};

	console.log('[Auth Debug] Layout Load - checking auth');

	if (data?.authToken) {
		console.log('[Auth Debug] Token found in data:', data.authToken.substring(0, 10) + '...');
		headers['Authorization'] = `Bearer ${data.authToken}`;
		headers['Cookie'] = `sprocket-token=${data.authToken}`;
	} else {
		console.log('[Auth Debug] No token found in data');
	}

	console.log('[Auth Debug] Fetching:', `${apiUrl}/auth/check`);
	const response = await fetch(`${apiUrl}/auth/check`, {
		headers,
		credentials: 'include'
	}).catch((e) => {
		console.error('[Auth Debug] Fetch error:', e);
		return { ok: false };
	});

	console.log('[Auth Debug] Response status:', response.status);

	if (!response.ok || !('json' in response)) {
		// handle core down
		console.warn('[Auth Debug] Core seems down or returned error');
		throw redirect(301, '/api-down');
	}

	const authValid = await response.json();
	console.log('[Auth Debug] Auth response body:', authValid);

	if (!authValid) {
		console.warn('[Auth Debug] Auth invalid, diverting to login');
		throw redirect(301, '/login');
	}

	const result = parse(UserSchema, authValid);
	console.log('[Auth Debug] Parsed user:', result.id);

	if (!result.active) {
		console.warn('[Auth Debug] User inactive');
		throw redirect(301, '/inactive');
	}

	return {
		user: result
	};
};
