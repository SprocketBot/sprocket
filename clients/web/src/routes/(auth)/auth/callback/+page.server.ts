import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const token = url.searchParams.get('token');
	if (token) {
		cookies.set('sprocket-token', token, {
			path: '/',
			httpOnly: true,
			secure: url.hostname !== 'localhost',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});
	}
};
