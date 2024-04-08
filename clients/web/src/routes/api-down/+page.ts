import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { apiUrl } from '../../lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const okay = () =>
		fetch(apiUrl + '/health')
			.then(() => true)
			.catch(() => false);
	if (await okay()) {
		// We're okay
		if (browser) {
			window.history.back();
		} else {
			throw redirect(301, '/');
		}
	} // else do nothing
	return {
		okay
	};
};
