import { error } from '@sveltejs/kit';
import {LeagueFixtureStore, load_LeagueFixture} from '$houdini';
import type { LoadEvent } from '@sveltejs/kit';

export async function load(event: LoadEvent) {
    const params = event.params;
    if (!params || !params.fixtureId) throw error(404);
    
    const variables = {
        id: parseInt(params.fixtureId),
    };
    
    const lfs = new LeagueFixtureStore();
    const { data } = await lfs.fetch({ event, variables });

    return {
        fixtureId: params.fixtureId,
        lfsData: data,
    };
}