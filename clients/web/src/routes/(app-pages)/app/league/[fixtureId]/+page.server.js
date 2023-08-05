import { error } from '@sveltejs/kit';

export function load({ params }) {
    if (!params || !params.fixtureId) throw error(404);
    return {
        fixtureId: params.fixtureId
    };
}